import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import dns from 'node:dns/promises';
import { WebSocketServer } from 'ws';
import {
  sleep,
  move,
  changeDir,
  collectCollectible,
  collisionDetect,
  verifColor,
  countCollectible,
} from '../src/game.js';

const NB_LEVEL = 15;
const DEFAULT_DELTA = 420;
const MIN_DELTA = 50;
const MAX_DELTA = 1500;
const MAX_STACK_DEPTH = 500;

const WIN = 0;
const FUNCTION_OVER = 1;
const OUT_OF_MAP = 2;
const CANCELLED = -2;

const NO_INST = { x: -1, y: -1 };

function send(player, payload) {
  if (player.ws.readyState === 1)
    player.ws.send(JSON.stringify(payload));
}

async function readLevel(mapsDir, level) {
  const file = path.join(mapsDir, `level_${level}.json`);
  const value = JSON.parse(await fs.readFile(file, 'utf8'));

  const instructions = (value.functions ?? []).map((size) =>
    Array.from({ length: size }, () => ({ movement: null, color: null }))
  );
  const data = {
    map: value.map,
    x: value.starting_pos.x,
    y: value.starting_pos.y,
    dir: value.starting_pos.dir,
    nbCollectible: countCollectible(value.map),
  };
  return { instructions, data };
}

class Lobby {
  constructor(players, mapsDir) {
    this.players = players;
    this.mapsDir = mapsDir;

    this.level = 1;
    this.instructions = [];
    this.startData = null;
    this.data = { map: [], x: 0, y: 0, dir: 'left', nbCollectible: 0 };

    this.play = false;
    this.paused = false;
    this.waiters = [];
    this.deltaTime = DEFAULT_DELTA;
    this.stack = [];
    this.currentInst = { ...NO_INST };
    this.popUp = null;

    this.runId = 0;
    this.closed = false;
    this.busy = true;
  }

  snapshot() {
    return {
      type: 'state',
      players: this.players.map((p) => p.name),
      level: this.level,
      instructions: this.instructions,
      data: this.data,
      play: this.play,
      paused: this.paused,
      deltaTime: this.deltaTime,
      stack: this.stack,
      currentInst: this.currentInst,
      popUp: this.popUp,
    };
  }

  broadcast() {
    if (this.closed) return;
    const message = JSON.stringify(this.snapshot());
    for (const p of this.players) {
      if (p.ws.readyState === 1)
        p.ws.send(message);
    }
  }

  async loadLevel(level) {
    const { instructions, data } = await readLevel(this.mapsDir, level);
    this.level = level;
    this.instructions = instructions;
    this.startData = data;
    this.data = structuredClone(data);
    this.stack = [];
    this.currentInst = { ...NO_INST };
  }

  resetData() {
    this.data = structuredClone(this.startData);
  }

  close(leaver) {
    if (this.closed) return;
    this.closed = true;
    this.runId++;
    this.play = false;
    this.paused = false;
    this.wake();
    for (const p of this.players) {
      p.lobby = null;
      if (p !== leaver)
        send(p, { type: 'left', name: leaver.name });
    }
  }

  async handle(player, msg) {
    if (this.closed || this.busy) return;

    switch (msg.type) {
      case 'setPlay': {
        if (this.popUp) return;
        if (msg.value === true) {
          if (!this.play) {
            this.run().catch((err) => console.error('[robozzle] run error:', err));
          } else if (this.paused) {
            this.paused = false;
            this.wake();
            this.broadcast();
          }
        } else if (msg.value === false && this.play && !this.paused) {
          this.paused = true;
          this.broadcast();
        }
        break;
      }

      case 'reset': {
        if (!this.play) return;
        this.stop();
        this.broadcast();
        break;
      }

      case 'speed': {
        const value = Number(msg.value);
        if (!Number.isFinite(value)) return;
        this.deltaTime = Math.min(MAX_DELTA, Math.max(MIN_DELTA, Math.round(value)));
        this.broadcast();
        break;
      }

      case 'edit': {
        if (this.play || this.popUp) return;
        const { func, index, tool } = msg;
        if (!Number.isInteger(func) || !Number.isInteger(index) || typeof tool !== 'string')
          return;
        const inst = this.instructions[func]?.[index];
        if (!inst || !this.applyTool(inst, tool)) return;
        this.broadcast();
        break;
      }

      case 'popup': {
        if (!this.popUp) return;
        this.popUp = null;
        this.resetData();
        this.broadcast();
        break;
      }

      case 'setLevel': {
        if (this.play || this.popUp) return;
        const level = Math.trunc(Number(msg.level));
        if (!(level >= 1 && level <= NB_LEVEL)) return;
        this.busy = true;
        try {
          await this.loadLevel(level);
        } catch (err) {
          console.error(`[robozzle] cannot load level ${level}:`, err.message);
        } finally {
          this.busy = false;
        }
        this.broadcast();
        break;
      }
    }
  }

  applyTool(inst, tool) {
    if (tool === 'blue' || tool === 'red' || tool === 'green')
      inst.color = tool;
    else if (tool === 'gray')
      inst.color = null;
    else if (tool === 'forward' || tool === 'left' || tool === 'right')
      inst.movement = tool;
    else if (tool === 'cancel') {
      inst.movement = null;
      inst.color = null;
    } else if (/^F\d+$/.test(tool)) {
      const target = Number(tool.slice(1)) - 1;
      if (target < 0 || target >= this.instructions.length) return false;
      inst.movement = target;
    } else
      return false;
    return true;
  }

  stop() {
    this.runId++;
    this.play = false;
    this.paused = false;
    this.wake();
    this.stack = [];
    this.currentInst = { ...NO_INST };
    this.resetData();
  }

  wake() {
    const waiters = this.waiters;
    this.waiters = [];
    for (const resolve of waiters) resolve();
  }

  async pace(id, ms) {
    await sleep(ms);
    while (this.paused && !this.closed && this.runId === id)
      await new Promise((resolve) => this.waiters.push(resolve));
  }

  async run() {
    const id = ++this.runId;
    this.resetData();
    this.stack = [];
    this.currentInst = { ...NO_INST };
    this.popUp = null;
    this.paused = false;
    this.play = true;
    this.broadcast();

    const code = await this.exec(id, 0);
    if (code === CANCELLED || this.closed || this.runId !== id) return;

    this.play = false;
    this.paused = false;
    this.stack = [];
    this.currentInst = { ...NO_INST };
    await this.finish(code);
  }

  async exec(id, funcIndex) {
    const active = () => !this.closed && this.runId === id;

    const insts = this.instructions[funcIndex];
    if (!insts || this.stack.length >= MAX_STACK_DEPTH)
      return FUNCTION_OVER;

    const frame = { func: funcIndex, index: 0 };
    this.stack.push(frame);
    this.broadcast();

    try {
      for (let i = 0; i < insts.length; i++) {
        if (!active()) return CANCELLED;

        const curr = insts[i];
        frame.index = i;
        this.currentInst = { x: funcIndex, y: i };
        this.broadcast();

        if (verifColor(curr.color, this.data.map, this.data) === true) {
          if (curr.movement === 'forward') {
            move(this.data);
            this.broadcast();
            await this.pace(id, this.deltaTime);
          } else if (curr.movement === 'left' || curr.movement === 'right') {
            changeDir(curr.movement, this.data);
            this.broadcast();
            await this.pace(id, this.deltaTime);
          } else if (typeof curr.movement === 'number') {
            await this.pace(id, this.deltaTime / 4);
            if (!active()) return CANCELLED;
            const code = await this.exec(id, curr.movement);
            if (code !== FUNCTION_OVER)
              return code;
          } else
            await this.pace(id, this.deltaTime);
        } else
          await this.pace(id, this.deltaTime);

        if (!active()) return CANCELLED;
        if (collisionDetect(this.data) === 1)
          return OUT_OF_MAP;

        collectCollectible(this.data);
        this.broadcast();
        if (this.data.nbCollectible === 0)
          return WIN;
      }

      return this.data.nbCollectible === 0 ? WIN : FUNCTION_OVER;
    } finally {
      if (active()) {
        this.stack.pop();
        this.broadcast();
      }
    }
  }

  async finish(code) {
    this.busy = true;
    try {
      if (code === WIN) {
        const done = this.level;
        if (done < NB_LEVEL) {
          this.popUp = { type: 'win_level', level: done };
          try {
            await this.loadLevel(done + 1);
          } catch (err) {
            console.error(`[robozzle] cannot load level ${done + 1}:`, err.message);
            this.popUp = { type: 'win_game', level: done };
          }
        } else
          this.popUp = { type: 'win_game', level: done };
      } else if (code === FUNCTION_OVER)
        this.popUp = { type: 'function_over', level: this.level };
      else if (code === OUT_OF_MAP)
        this.popUp = { type: 'out_of_map', level: this.level };
    } finally {
      this.busy = false;
    }
    this.broadcast();
  }
}

function shortName(hostname) {
  return String(hostname).split('.')[0];
}

function localAddresses() {
  return new Set(
    Object.values(os.networkInterfaces())
      .flat()
      .filter(Boolean)
      .map((iface) => iface.address)
  );
}

async function resolveName(req, url) {
  const forced = url.searchParams.get('name');
  if (forced)
    return forced.replace(/[\u0000-\u001f]/g, '').slice(0, 32) || 'player';

  const ip = (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
  if (ip === '::1' || ip === '127.0.0.1' || localAddresses().has(ip))
    return shortName(os.hostname());

  try {
    const names = await Promise.race([
      dns.reverse(ip),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ]);
    if (names && names[0])
      return shortName(names[0]);
  } catch {}
  return ip || 'player';
}

export function attachGameServer(httpServer, { mapsDir }) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
  const queue = [];

  httpServer.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.endsWith('/ws')) return;
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req, url));
  });

  function leaveQueue(player) {
    const i = queue.indexOf(player);
    if (i !== -1) queue.splice(i, 1);
    player.queued = false;
  }

  async function createLobby(players) {
    const lobby = new Lobby(players, mapsDir);
    for (const p of players)
      p.lobby = lobby;

    try {
      await lobby.loadLevel(1);
    } catch (err) {
      console.error('[robozzle] cannot load level 1:', err.message);
      if (!lobby.closed) {
        lobby.closed = true;
        for (const p of players) {
          p.lobby = null;
          send(p, { type: 'error', message: `Unable to load level 1 (${err.message})` });
        }
      }
      return;
    }

    lobby.busy = false;
    lobby.broadcast();
  }

  function matchmake() {
    while (queue.length >= 2) {
      const a = queue.shift();
      const b = queue.shift();
      a.queued = false;
      b.queued = false;
      createLobby([a, b]);
    }
  }

  wss.on('connection', (ws, req, url) => {
    const player = { ws, name: 'player', lobby: null, queued: false };
    ws.on('error', () => {});

    const ready = resolveName(req, url).then((name) => {
      player.name = name;
      send(player, { type: 'welcome', name });
    });

    ws.on('close', () => {
      leaveQueue(player);
      if (player.lobby) player.lobby.close(player);
    });

    ws.on('message', async (raw) => {
      try {
        await ready;
        const msg = JSON.parse(raw.toString());
        if (!msg || typeof msg.type !== 'string') return;

        switch (msg.type) {
          case 'join':
            if (player.lobby || player.queued) return;
            player.queued = true;
            queue.push(player);
            send(player, { type: 'queued' });
            matchmake();
            break;

          case 'solo':
            if (player.lobby || player.queued) return;
            createLobby([player]);
            break;

          case 'cancel':
            leaveQueue(player);
            send(player, { type: 'idle' });
            break;

          case 'leave':
            if (player.lobby) player.lobby.close(player);
            send(player, { type: 'idle' });
            break;

          default:
            if (player.lobby) await player.lobby.handle(player, msg);
        }
      } catch (err) {
        if (!(err instanceof SyntaxError))
          console.error('[robozzle] message error:', err);
      }
    });
  });

  return wss;
}

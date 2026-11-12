import { useEffect, useRef, useState } from 'preact/hooks'
import Router from 'preact-router';
import { Level } from './components/Level'
import { Controls } from './components/Controls'
import { Canva } from './components/Canva'
import { Composition } from './components/Composition'
import { Toolbar } from './components/Toolbar'
import { CallStack } from './components/CallStack'
import { PopUp } from './components/PopUp'
import { Menu } from './components/Menu'
import { SPACE_BG } from './components/Sprites'
import { messages } from './messages'

export const THEME = false;

function getSavedLevel() {
  const level = Number(localStorage.getItem("level"));
  return Number.isInteger(level) && level >= 1 ? level : 1;
}

function getSocketUrl() {
  if (import.meta.env.VITE_WS_URL)
    return import.meta.env.VITE_WS_URL;

  const proto = location.protocol === "https:" ? "wss" : "ws";
  const url = new URL(`${proto}://${location.host}${import.meta.env.BASE_URL}ws`);
  const forced = new URLSearchParams(location.search).get("name");
  if (forced)
    url.searchParams.set("name", forced);
  return url.toString();
}

function getPopUpContent(popUp) {
  const lang = THEME ? "theme" : "en";
  const entry = messages[popUp.type];
  let text = entry.label[lang];

  if (popUp.type === "win_level" && THEME) {
    if (popUp.level == 1)
      text = "Bravo, niveau 1/3 réussi ! Tu peux passer au grand bain !";
    else if (popUp.level == 2)
      text = "Bravo, niveau 2/3 réussi ! Bientôt champion !";
  }
  return { text, button: entry.button[lang] };
}

export function App() {
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState("");
  const [queued, setQueued] = useState(false);
  const [queueLevel, setQueueLevel] = useState(1);
  const [notice, setNotice] = useState("");

  const [game, setGame] = useState(null);

  const [selected, setSelected] = useState("");

  const wsRef = useRef(null);
  const wasConnected = useRef(false);
  const lastSpeedEdit = useRef(0);

  function send(msg) {
    const ws = wsRef.current;
    if (ws && ws.readyState === 1)
      ws.send(JSON.stringify(msg));
  }

  useEffect(() => {
    let ws = null;
    let retry = null;
    let disposed = false;

    function onMessage(msg) {
      switch (msg.type) {
        case "welcome":
          wasConnected.current = true;
          setName(msg.name);
          setConnected(true);
          break;
        case "progress":
          localStorage.setItem("level", String(msg.level));
          break;
        case "queued":
          setGame(null);
          setQueued(true);
          setQueueLevel(msg.level);
          setNotice("");
          break;
        case "idle":
          setQueued(false);
          setGame(null);
          break;
        case "state":
          setQueued(false);
          setNotice("");
          setGame((prev) => {
            const keepLocalSpeed = prev && Date.now() - lastSpeedEdit.current < 400;
            return { ...msg, deltaTime: keepLocalSpeed ? prev.deltaTime : msg.deltaTime };
          });
          break;
        case "left":
          setQueued(false);
          setGame(null);
          setNotice(`${msg.name} left the game.`);
          break;
        case "error":
          setQueued(false);
          setGame(null);
          setNotice(msg.message);
          break;
      }
    }

    function connect() {
      ws = new WebSocket(getSocketUrl());
      wsRef.current = ws;
      ws.onmessage = (event) => {
        try {
          onMessage(JSON.parse(event.data));
        } catch (error) {
          console.error(error);
        }
      };
      ws.onclose = () => {
        setConnected(false);
        setQueued(false);
        setGame(null);
        if (wasConnected.current)
          setNotice("Connection to the server lost.");
        wasConnected.current = false;
        if (!disposed)
          retry = setTimeout(connect, 2000);
      };
    }

    connect();
    return () => {
      disposed = true;
      clearTimeout(retry);
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    setSelected("");
  }, [game ? game.level : null]);

  const setPlay = (value) => send({ type: "setPlay", value });
  const resetRun = () => send({ type: "reset" });

  const setDeltaTime = (value) => {
    lastSpeedEdit.current = Date.now();
    setGame((g) => (g ? { ...g, deltaTime: value } : g));
    send({ type: "speed", value });
  };

  const editTile = (func, index) => {
    if (!game || game.play || !selected)
      return;
    send({ type: "edit", func, index, tool: selected });
  };

  const setLevel = (level) => send({ type: "setLevel", level });
  const closePopUp = () => send({ type: "popup" });
  const leaveGame = () => send({ type: "leave" });

  const popUpContent = game && game.popUp ? getPopUpContent(game.popUp) : { text: "", button: "" };

  return (
    <>
      <Router>
        <div path="/42LeHavreRoboZZle/">
          {game ? (
            <>
              <PopUp active={!!game.popUp} setActive={() => {}} button={popUpContent.button} actionButton={closePopUp} game={null}>{popUpContent.text}</PopUp>
              <div className="relative w-screen flex flex-row justify-center items-center h-screen px-2 gap-4 text-gray-800" style={SPACE_BG}>
                <div className="absolute top-2 left-3 right-3 flex justify-between items-center text-sm text-indigo-200 z-10">
                  <span>{game.players.join(" & ")}</span>
                  <button onClick={leaveGame} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 ring-1 ring-white/10 text-white transition-all">Quit</button>
                </div>
                <div className="flex flex-col justify-center items-center h-full w-full max-w-[500px]">
                  <Level level={game.level} setLevel={setLevel}></Level>
                  <Canva data={game.data}></Canva>
                  <Composition play={game.play} instance={game} onEdit={editTile} currentInst={game.currentInst}></Composition>
                  <Controls game={game} play={game.play} paused={game.paused} setPlay={setPlay} onReset={resetRun} data={game.data} setDeltaTime={setDeltaTime} deltaTime={game.deltaTime}></Controls>
                  <Toolbar functions={game.instructions} selected={selected} setSelected={setSelected}></Toolbar>
                </div>
                <CallStack stack={game.stack} instance={game}></CallStack>
              </div>
            </>
          ) : (
            <Menu
              name={name}
              connected={connected}
              queued={queued}
              queueLevel={queueLevel}
              notice={notice}
              onPlay={() => send({ type: "join", level: getSavedLevel() })}
              onSolo={() => send({ type: "solo", level: getSavedLevel() })}
              onCancel={() => send({ type: "cancel" })}
            />
          )}
        </div>
        <div default className="w-screen h-screen flex justify-center items-center text-xl font-semibold text-white bg-[#0b1020]">
          <h1>404 : Not found</h1>
        </div>
      </Router>
    </>
  )
}

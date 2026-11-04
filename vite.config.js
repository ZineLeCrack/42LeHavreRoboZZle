import path from 'node:path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { attachGameServer } from './server/game-server.js'

function robozzleGameServer() {
  const attach = (server) => {
    if (!server.httpServer) return
    const { publicDir, root } = server.config
    attachGameServer(server.httpServer, {
      mapsDir: path.join(publicDir || path.join(root, 'public'), 'maps'),
    })
  }

  return {
    name: 'robozzle-game-server',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

export default defineConfig({
  base: '/42LeHavreRoboZZle/',
  plugins: [preact(), robozzleGameServer()],
  server: { host: true, allowedHosts: true },
  preview: { host: true, allowedHosts: true },
})

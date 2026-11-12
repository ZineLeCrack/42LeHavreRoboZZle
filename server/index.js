
import { createServer } from 'node:http';
import path from 'node:path';
import { attachGameServer } from './game-server.js';

const PORT = process.env.PORT || 3000;

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

attachGameServer(httpServer, {
  mapsDir: path.join(process.cwd(), 'public', 'maps'),
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[robozzle] Server listening on port ${PORT}`);
});

import http from 'http';
import { config } from './config/index.js';
import app from './app.js';
import { initSocket } from './socket/index.js';
import { prisma } from './db/prisma.js';

const server = http.createServer(app);

initSocket(server);

const host = process.env.HOST || '0.0.0.0';
server.listen(config.port, host, () => {
  console.log(`RMS Backend running at http://${host}:${config.port}`);
  console.log(`  Health: http://${host}:${config.port}/health`);
  console.log(`  API:    http://${host}:${config.port}/api`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

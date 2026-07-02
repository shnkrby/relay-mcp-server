
  import 'dotenv/config';
  import { server } from './server.js';

const PORT = Number(process.env.PORT) || 3000;

server.start({
  transportType: 'httpStream',
  httpStream: {
    port: PORT,
  },
});

console.log(`MCP Server listening on port ${PORT}`);

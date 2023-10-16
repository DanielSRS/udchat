import { createUDPServer } from '@udchat/socket';

const server = createUDPServer();

setTimeout(() => {
  server.close();
}, 1000);
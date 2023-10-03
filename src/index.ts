import { createUDPClient, createUDPServer, socketLibVersion } from "./lib/Socket/socket";

// const myWorker = new Worker(import.meta.dir + "/worker.ts");

// Bun.sleep(1000);

// myWorker.onmessage = function(e) {
//   console.log('Message received from worker: ', e.data);
// }

// myWorker.postMessage(['first.value', 'second.value']);


// console.log("Hello via Bun!");
// console.log("✅ using socketLib with version: ", socketLibVersion());

// console.log('\nCriando server: ');
// createUDPServer();
// console.log('\n');

const server = createUDPServer();

setTimeout(() => {
  server.close();
}, 1000);
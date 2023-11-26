// @ts-check
'use strict';
const { parentPort } = require('worker_threads');
const dgram = require('node:dgram');

const SEPARATOR = Buffer.from('\r\n');

const handleOnMessageEvent = (/** @type {unknown} */ event) => {
  parentPort?.postMessage(event);
}

parentPort?.on('message', handleOnMessageEvent);

// Create a new socket instance
const socket = dgram.createSocket('udp4');
// Bind the socket to port 4321
socket.bind(4321);

// Register a listener for the 'message' event
socket.on('message', (msg, rinfo) => {
  try {
    const headerEndIndex = msg.indexOf(SEPARATOR);
    if (headerEndIndex === -1) {
      return parentPort?.postMessage({
        info: `Received message with length: ${msg.length} from ${rinfo.address}:${rinfo.port}`,
        error: 'separator not found'
      });
    }

    return parentPort?.postMessage({
      info: `Received message with length: ${msg.length} from ${rinfo.address}:${rinfo.port}`,
      // aqui pode dar erro
      header: JSON.parse(msg.toString('utf8', 0, headerEndIndex)),
    });
  } catch(e) {
    return parentPort?.postMessage({
      info: `Received message with length: ${msg.length} from ${rinfo.address}:${rinfo.port}`,
      error: e,
    });
  }
  // Print the received message and the sender's address
  // parentPort.postMessage(`Received message with length: ${msg.length} from ${rinfo.address}:${rinfo.port}`);
  // console.log(`Received: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

// Register a listener for the 'error' event
socket.on('error', (err) => {
  // Print the error and close the socket
  console.error(`Socket error: ${err.stack}`);
  socket.close();
});

// Register a listener for the 'listening' event
socket.on('listening', () => {
  // Print the socket's address
  const address = socket.address();
  console.log(`Socket listening on ${address.address}:${address.port}`);
});

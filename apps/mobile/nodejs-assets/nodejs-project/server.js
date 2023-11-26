// @ts-check
'use strict';

const { Worker } = require('worker_threads');
// @ts-ignore
const rn_bridge = require('rn-bridge');

const serverWorker = new Worker(__dirname + '/serverWorker.js');
serverWorker.on('message', val => {
  rn_bridge.channel.post('serverWorker', val);
});

const initServer = () => {
  rn_bridge.channel.on('serverWorker', ( /** @type {unknown} */ message) => {
    serverWorker?.postMessage(message);
  });
}

module.exports = {
  initServer,
}
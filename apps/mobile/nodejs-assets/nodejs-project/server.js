// @ts-check
'use strict';

const { Worker } = require('worker_threads');
// @ts-ignore
const rn_bridge = require('rn-bridge');

const serverWorker = new Worker(__dirname + '/serverWorker.js');
serverWorker.on('message', event => {
  if (
    event
    && typeof event === 'object'
    && 'type' in event
    && (event.type === 'sendMessageResponse'
      || event.type === 'newMessage'
      || event.type ===  'UPDATE_CRYPTO_KEYS_RESPONSE'
      || event.type === 'amOnlineAt'
    )) {
    rn_bridge.channel.post('network', event);
    return;
  }
  rn_bridge.channel.post('serverWorker', event);
});

const initServer = () => {
  // rn_bridge.channel.on('serverWorker', ( /** @type {unknown} */ message) => {
  //   serverWorker?.postMessage(message);
  // });
  rn_bridge.channel.on('network', (/** @type {any} */ message) => {
    serverWorker?.postMessage(message);
  });
}

module.exports = {
  initServer,
}
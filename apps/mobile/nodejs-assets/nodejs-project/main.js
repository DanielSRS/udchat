'use strinct';

const { publicEncrypt, privateDecrypt, sign, symetricDecryption, symetricEncryption, verify } = require('./encryption');
const { Worker } = require('worker_threads');
// @ts-ignore
const rn_bridge = require('rn-bridge');


/**
 * 
 * @param {unknown} message 
 */
function dispatchMessage(message) {
  const data = (() => {

    // Se for encrypt
    if (
      message !== null
    && typeof message === 'object'
    && 'type' in message
    && 'data' in message
    && message?.type === 'publicEncrypt'
    && typeof message.data === 'object'
    && message.data !== null
    && 'key' in message.data
    && 'value' in message.data
    && typeof message.data.key === 'string'
    && typeof message.data.value === 'string'
    ) {
      return publicEncrypt({
        key: message.data.key,
        data: message.data.value
      });
    }

    // Se for privateDecrypt
    if (
      message !== null
    && typeof message === 'object'
    && 'type' in message
    && 'data' in message
    && message?.type === 'privateDecrypt'
    && typeof message.data === 'object'
    && message.data !== null
    && 'key' in message.data
    && 'value' in message.data
    && typeof message.data.key === 'string'
    && typeof message.data.value === 'string'
    ) {
      return privateDecrypt({
        key: message.data.key,
        data: message.data.value
      });
    }

    // Se for sign
    if (
      message !== null
    && typeof message === 'object'
    && 'type' in message
    && 'data' in message
    && message?.type === 'sign'
    && typeof message.data === 'object'
    && message.data !== null
    && 'key' in message.data
    && 'value' in message.data
    && typeof message.data.key === 'string'
    && typeof message.data.value === 'string'
    ) {
      return sign({
        key: message.data.key,
        data: message.data.value
      });
    }

    // Se for symetricDecryption
    if (
      message !== null
    && typeof message === 'object'
    && 'type' in message
    && 'data' in message
    && message?.type === 'symetricDecryption'
    && typeof message.data === 'object'
    && message.data !== null
    && 'key' in message.data
    && 'value' in message.data
    && typeof message.data.key === 'string'
    && typeof message.data.value === 'string'
    ) {
      return symetricDecryption(
        message.data.value,
        message.data.key,
      );
    }

    // Se for symetricEncryption
    if (
      message !== null
    && typeof message === 'object'
    && 'type' in message
    && 'data' in message
    && message?.type === 'symetricEncryption'
    && typeof message.data === 'object'
    && message.data !== null
    && 'value' in message.data
    && typeof message.data.value === 'string'
    ) {
      return symetricEncryption(
        message.data.value
      );
    }

    // Se for verify
    if (
      message !== null
    && typeof message === 'object'
    && 'type' in message
    && 'data' in message
    && message?.type === 'verify'
    && typeof message.data === 'object'
    && message.data !== null
    && 'key' in message.data
    && 'value' in message.data
    && 'signature' in message.data
    && typeof message.data.key === 'string'
    && typeof message.data.value === 'string'
    && typeof message.data.signature === 'string'
    ) {
      return verify({
        key: message.data.key,
        data: message.data.value,
        signature: message.data.signature,
      });
    }

    // se for desconhecido
    return {
      logs: ['evento desconhecido'],
    }

  })();
  const response = {
    // @ts-ignore
    eventType: message?.type || 'unkown',
    response: data,
  };
  rn_bridge.channel.send(response);
}

// Echo every message received from react-native.
rn_bridge.channel.on('message', dispatchMessage);
rn_bridge.channel.on('serverWorker', ( /** @type {unknown} */ message) => {
  serverWorker?.postMessage(message);
});

// Inform react-native node is initialized.
rn_bridge.channel.send({ eventType: 'nodeStarted', logs: ["Node was initialized."] });


/** @param {unknown} event  */
function isEncryptEvent(event) {
  if (
    event !== null
    && typeof event === 'object'
    && 'type' in event
    && 'data' in event
    && event?.type === 'encrypt'
    && typeof event.data === 'object'
    && event.data !== null
    && 'key' in event.data
    && 'value' in event.data
    && typeof event.data.key === 'string'
    && typeof event.data.value === 'string'
  ) {
    return true;
  }

  return false;
}

/**
 * 
 * 
 * 
 * 
 * 
 * Worker area
 */

/** @type {Worker | undefined} */
let serverWorker = undefined;

try {
  serverWorker = new Worker(__dirname + '/serverWorker.js');

  serverWorker.on('message', val => {
    rn_bridge.channel.post('serverWorker', val);
  });
} catch(e) {
  rn_bridge.channel.post('serverWorker', e);
}

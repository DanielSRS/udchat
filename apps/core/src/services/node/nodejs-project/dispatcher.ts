import {
  publicEncrypt,
  privateDecrypt,
  sign,
  symetricDecryption,
  symetricEncryption,
  verify,
} from './encryption';
import { initServer } from './server';
import { ipHandler } from './ip';
import { rn_bridge } from './libs';

function dispatchMessage(message: any) {
  console.log('dispatchMessage');
  const data = (() => {
    if (message === null || typeof message !== 'object') {
      return { logs: ['message is not an object'] };
    }
    if (!('type' in message)) {
      return { logs: ['evento não informado'] };
    }
    if (!('data' in message)) {
      return { logs: ['no data sent'] };
    }
    if (typeof message.data !== 'object' || message.data === null) {
      return { logs: ['data is not an object'] };
    }
    if (!('value' in message.data) || typeof message.data.value !== 'string') {
      return { logs: ['no string value sent'] };
    }

    // Se for symetricEncryption
    if (message?.type === 'symetricEncryption') {
      return symetricEncryption(message.data.value);
    }

    if (!('key' in message.data) || typeof message.data.key !== 'string') {
      return { logs: ['no string key sent'] };
    }

    // Se for encrypt
    if (message?.type === 'publicEncrypt') {
      return publicEncrypt({
        key: message.data.key,
        data: message.data.value,
      });
    }

    // Se for privateDecrypt
    if (message?.type === 'privateDecrypt') {
      return privateDecrypt({
        key: message.data.key,
        data: message.data.value,
      });
    }

    // Se for sign
    if (message?.type === 'sign') {
      return sign({
        key: message.data.key,
        data: message.data.value,
      });
    }

    // Se for symetricDecryption
    if (message?.type === 'symetricDecryption') {
      return symetricDecryption(message.data.value, message.data.key);
    }

    if (
      !('signature' in message.data) ||
      typeof message.data.signature !== 'string'
    ) {
      return { logs: ['no string signature sent'] };
    }

    // Se for verify
    if (message?.type === 'verify') {
      return verify({
        key: message.data.key,
        data: message.data.value,
        signature: message.data.signature,
      });
    }

    // se for desconhecido
    return { logs: ['evento super desconhecido'] };
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
rn_bridge.channel.on('ip', ipHandler);
initServer();

// Inform react-native node is initialized.
rn_bridge.channel.send({
  eventType: 'nodeStarted',
  logs: ['Node was initialized.'],
});
// console.log('nodeStarted');

export const initDispatcher = () => {
  /* console.log('diapatcher initiated') */
};

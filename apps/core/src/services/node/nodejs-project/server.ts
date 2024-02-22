import { Worker, rn_bridge } from './libs';

/**
 * O caminho desse aquivo não existe no projeto. Ele é criado
 * apos a compilação de criação do bundle.
 *
 * O arquivo do worker, é na verdade o arquivo server.worker.ts
 * aqui nesse diretório
 */
const serverWorker = new Worker('./bundle/server.worker.js');
serverWorker.on('message', event => {
  if (
    event &&
    typeof event === 'object' &&
    'type' in event &&
    (event.type === 'sendMessageResponse' ||
      event.type === 'newMessage' ||
      event.type === 'UPDATE_CRYPTO_KEYS_RESPONSE' ||
      event.type === 'amOnlineAt')
  ) {
    rn_bridge.channel.post('network', event);
    return;
  }
  rn_bridge.channel.post('serverWorker', event);
});

export const initServer = () => {
  // rn_bridge.channel.on('serverWorker', (message: unknown) => {
  //   serverWorker?.postMessage(message);
  // });
  rn_bridge.channel.on('network', (message: unknown) => {
    serverWorker?.postMessage(message);
  });
};

// module.exports = {
//   initServer,
// }

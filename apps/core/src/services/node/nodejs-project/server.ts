import { Worker } from 'worker_threads';
import rn_bridge from '../nodeBridge';

/**
 * O caminho desse aquivo não existe no projeto. Ele é criado
 * apos a compilação de criação do bundle.
 * 
 * O arquivo do worker, é na verdade o arquivo server.worker.ts
 * aqui nesse diretório
 */
const serverWorker = new Worker('./bundle/server.worker.js');
serverWorker.on('message', val => {
  rn_bridge.channel.post('serverWorker', val);
});

export const initServer = () => {
  rn_bridge.channel.on('serverWorker', (message: unknown) => {
    serverWorker?.postMessage(message);
  });
}

// module.exports = {
//   initServer,
// }
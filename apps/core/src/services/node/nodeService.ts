import { nodeRequestEvent, nodeResponseEventMap, nodeResponseEventType } from './nodeEventTypes';
import nodejs from './nodejs';

// nodejs.start('main.js');
const initializationMessage = (message: unknown) => console.log(JSON.stringify({ e: message }, null, 2));

const responseQueue: Array<(v: unknown) => void> = [];

const ipResponseQueue = [] as Array<(v: unknown) => void>;
const ipEventHandler = (message: unknown) => {
  const resolve = ipResponseQueue.shift();
  resolve?.(message);
}
nodejs.channel.addListener('ip', ipEventHandler);
export interface NET {
  event: 'NETWORK_INTERFACES';
  interfaces: {
    [key: string]: string[];
  };
}
export const getNetworkInterfaces = () => {
  const res = new Promise<NET>(resolve => {
    ipResponseQueue.push(resolve as (m: unknown) => void);
    nodejs.channel.post('ip', {});
  });
  return res;
}

const nodeEventHandler = (message: unknown) => {
  console.log('From nodeEventHandler');
  const resolve = responseQueue.shift();
  if (resolve) {
    return resolve(message);
  }
  console.log("não tem callback");
  console.log(JSON.stringify({ e: message }, null, 2));
}

nodejs.channel.addListener('message', nodeEventHandler);
// nodejs.channel.addListener('serverWorker', (msg) => {
//   console.log('from serverWorker: ');
//   console.log(JSON.stringify({ msg: msg }, null, 2));
// });

export const sendEventToNode = <T extends nodeResponseEventType>(event: { type: T } & nodeRequestEvent) => {
  const res = new Promise<nodeResponseEventMap[T]>(resolve => {
    responseQueue.push(resolve as (m: unknown) => void);
    nodejs.channel.send(event);
  });
  return res;
}

export const sendEventToServer = <T extends { type: 'serverWorker' }>(event: T) => {
  nodejs.channel.post('serverWorker', event);
}

export const initNodeService = (mobile: boolean = false) => {
  // console.log('nodeservice');
  if (mobile) {
    console.log('started as mobile');
    responseQueue.push(initializationMessage);
  }
  nodejs.start('main.js');
};

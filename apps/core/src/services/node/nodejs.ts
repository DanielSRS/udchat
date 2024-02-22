import { nodejsListners, sendMessageToBridge } from './nodeSharedState';
import { initDispatcher } from './nodejs-project/dispatcher';

initDispatcher();

const addChannelListner = (
  channelName: string,
  callbackFunction: (msg: unknown) => void,
) => {
  // console.log('nodejs addChannelListner');
  const channel = nodejsListners[channelName];
  if (channel) {
    channel.push(callbackFunction);
    return;
  }

  nodejsListners[channelName] = [callbackFunction];
};

const removeChannelListner = (
  channelName: string,
  callbackFunction: (msg: unknown) => void,
) => {
  const channel = nodejsListners[channelName]; // Canal com os listners
  if (!channel) {
    return;
  } // Se não tem listners no canal

  let index = channel.findIndex(v => v === callbackFunction); // Encontra o indice do listner pra remover
  if (index === -1) {
    return;
  } // Se listner não esta registrado no canal

  channel.splice(index, 1); // Remove o registro
};

const sendMessageToDefaultChannel = (message: unknown) =>
  sendMessageToBridge('message', message);

export default {
  channel: {
    addListener: addChannelListner,
    post: sendMessageToBridge,
    send: sendMessageToDefaultChannel,
    removeListener: removeChannelListner,
  },
  start: () => {},
};

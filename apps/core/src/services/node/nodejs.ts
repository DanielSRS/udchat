import { nodejsListners, sendMessageToBridge } from "./nodeSharedState";
import { initDispatcher } from "./nodejs-project/dispatcher";

initDispatcher();

const addChannelListner = (channelName: string, callbackFunction: (msg: unknown) => void) => {
  // console.log('nodejs addChannelListner');
  const channel = nodejsListners[channelName];
  if (channel) {
    channel.push(callbackFunction);
    return;
  }

  nodejsListners[channelName] = [callbackFunction];
}

const sendMessageToDefaultChannel = (message: unknown) => sendMessageToBridge('message', message);

export default {
  channel: {
    addListener: addChannelListner,
    post: sendMessageToBridge,
    send: sendMessageToDefaultChannel,
  }
}
import { nodeBridgeListners, sendMessageToNode } from "./nodeSharedState";

const addChannelListner = (channelName: string, callbackFunction: (msg: unknown) => void) => {
  // console.log('addChannelListner mmm');
  const channel = nodeBridgeListners[channelName];
  if (channel) {
    // console.log('new lll');
    channel.push(callbackFunction);
    return;
  }
  
  nodeBridgeListners[channelName] = [callbackFunction];
  // console.log(typeof callbackFunction);
  // console.log('não foi preciso', JSON.stringify(nodeBridgeListners, null, 2));
}

const sendMessageToDefaultChannel = (message: unknown) => sendMessageToNode('message', message);

export default {
  channel: {
    on: addChannelListner,
    post: sendMessageToNode,
    send: sendMessageToDefaultChannel,
  }
}
/** Received messages from bridge
 */
export const nodejsListners: { [key: string]: Array<(msg: unknown) => void> } = {};

/** Received messages from nodejs 
 */
export const nodeBridgeListners: { [key: string]: Array<(msg: unknown) => void> } = {};

export const sendMessageToBridge = (channelName: string, message: unknown) => {
  const channels = nodeBridgeListners[channelName];
  // console.log('sendMessageToBridge: ', JSON.stringify(channels, null, 2));

  channels?.forEach(listner => listner(message));
}

export const sendMessageToNode = (channelName: string, message: unknown) => {
  // console.log('sendMessageToNode ', JSON.stringify(nodejsListners, null, 2));
  const channels = nodejsListners[channelName];

  channels?.forEach(listner => listner(message));
}

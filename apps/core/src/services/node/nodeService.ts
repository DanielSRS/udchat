import nodejs from "nodejs-mobile-react-native";

// nodejs.start('main.js');
const initializationMessage = (message: unknown) => console.log(JSON.stringify({ e: message }, null, 2));

const responseQueue: Array<(v: unknown) => void> = [initializationMessage];

const nodeEventHandler = (message: unknown) => {
  console.log('From nodeEventHandler');
  const resolve = responseQueue.shift();
  if (resolve) {
    return resolve(message);
  }
  console.log("não tem callback");
  // console.log(JSON.stringify({ e: message }, null, 2));
}

nodejs.channel.addListener('message', nodeEventHandler);

export const sendEventToNode = <T extends nodeResponseEventType>(event: { type: T } & nodeRequestEvent) => {
  const res = new Promise<nodeResponseEventMap[T]>(resolve => {
    responseQueue.push(resolve as (m: unknown) => void);
    nodejs.channel.send(event);
  });
  return res;
}

export const initNodeService = () => console.log('nodeservice');

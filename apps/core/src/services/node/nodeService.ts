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

export const sendEventToNode = (event: object) => {
  if (!event) {
    return new Promise((_, reject) => reject());
  }
  const res = new Promise(resolve => {
    responseQueue.push(resolve);
    nodejs.channel.send(event);
  });
  return res;
}

export const initNodeService = () => console.log('nodeservice');

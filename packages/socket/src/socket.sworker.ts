import { readOnce } from './socket';

interface firstMessage {
  socketDescriptor: number,
  bufferSizeInBytes: number,
}

type OnMessage = (e: { data: unknown }) => void;
const self = globalThis as (typeof globalThis & { onmessage: OnMessage });

const handleOnMessageEvent: OnMessage = (event) => {
  const data = (event.data ?? {}) as firstMessage;

  // verifica os dados
  if (typeof data.bufferSizeInBytes !== 'number' || typeof data.socketDescriptor !== 'number') {
    postMessage({
      sucess: false,
    });
  }

  const res = readOnce(data.socketDescriptor, data.bufferSizeInBytes);
  postMessage({
    sucess: res,
  });
}

self.onmessage = handleOnMessageEvent;

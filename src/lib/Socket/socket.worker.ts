import { listenForConnections } from './socket';

type OnMessage = (e: { data: unknown }) => void;
const self = globalThis as (typeof globalThis & { onmessage: OnMessage });

const handleOnMessageEvent: OnMessage = (event) => {
  const serverSocket = (event.data as { serverSocket: number }).serverSocket;
  listenForConnections(serverSocket);
}

self.onmessage = handleOnMessageEvent;

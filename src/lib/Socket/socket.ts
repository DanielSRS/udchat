import { dlopen, FFIType, ptr, suffix } from "bun:ffi";

const CURRENT_DIR = import.meta.dir;

// `suffix` is either "dylib", "so", or "dll" depending on the platform
// you don't have to use "suffix", it's just there for convenience
const path = `${CURRENT_DIR}/socket.${suffix}`;

/** Versão da lib  */
export const { symbols:
  { socketLibVersion,
    createUDPClientSocket,
    createServerConnectionAddress,
    freeServerConnectionAddress,
    closeUDPClientSocket,
    clientSend,
    createUDPServerSocket,
    bindServerAddress,
    listenForConnections,
    closeServerSocket,
  }
} = dlopen(path, // a library name or file path
  {
    socketLibVersion: {
      args: [],
      returns: FFIType.cstring,
    },
    createUDPClientSocket: {
      args: [],
      returns: FFIType.int,
    },
    createServerConnectionAddress: {
      args: [FFIType.cstring, FFIType.int],
      returns: FFIType.pointer,
    },
    freeServerConnectionAddress: {
      args: [FFIType.pointer],
      returns: FFIType.void,
    },
    closeUDPClientSocket: {
      args: [FFIType.int],
      returns: FFIType.void,
    },
    clientSend: {
      args: [FFIType.int, FFIType.cstring, FFIType.int, FFIType.pointer],
      returns: FFIType.void,
    },
    createUDPServerSocket: {
      // no arguments, returns a string
      args: [],
      returns: FFIType.int,
    },
    bindServerAddress: {
      // no arguments, returns a string
      args: [FFIType.int, FFIType.cstring, FFIType.int],
      returns: FFIType.bool,
    },
    listenForConnections: {
      // no arguments, returns a string
      args: [FFIType.int],
      returns: FFIType.void,
    },
    closeServerSocket: {
      // no arguments, returns a string
      args: [FFIType.int],
      returns: FFIType.void,
    },
  },
);


export const createUDPClient = (host: string, port: string) => {
  const udpSocket = createUDPClientSocket();
  const hostptr = Buffer.from(`${host}\0`, "utf8");
  const address = createServerConnectionAddress(ptr(hostptr), Number(port));
  let closed = false;

  const close = () => {
    if (closed) {
      return;
    }
    closeUDPClientSocket(udpSocket);
    freeServerConnectionAddress(address);
  }

  const send = (message: string) => {
    const msg = Buffer.from(`${message}\0`, 'utf-8');
    clientSend(udpSocket, ptr(msg), message.length, address);
  }

  return {
    close,
    send,
  }
}

export const createUDPServer = () => {
  const serverSocket = createUDPServerSocket();
  const host = Buffer.from('127.0.0.1' + '\0', 'utf-8');
  const binded = bindServerAddress(serverSocket, ptr(host), 3490);
  const stopMessage = `;_stop~server~on~socket:{${serverSocket}};`;
  let udpServerWorker: Worker | undefined = undefined;
  if (binded) {
    console.log('binded server');
    udpServerWorker = new Worker(import.meta.dir + "/socket.worker.ts");
    udpServerWorker.postMessage({ serverSocket });
    // listenForConnections(serverSocket);
  }

  return {
    close: () => {
      const client = createUDPClient('127.0.0.1', "3490");
      client.send(stopMessage);
      client.close();
      setTimeout(() => {
        udpServerWorker?.terminate();
      }, 1000);
      closeServerSocket(serverSocket);
    }
  }
}

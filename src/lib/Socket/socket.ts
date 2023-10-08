import { dlopen, FFIType, ptr, suffix } from "bun:ffi";
import { UPDSocket } from "./ISocket";

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
    readOnce,
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
    readOnce: {
      args: [FFIType.int, FFIType.int],
      returns: FFIType.bool,
    }
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

const createUDPSocket = () => {
  const socketDescriptor = createUDPClientSocket();
  let closed = false;

  const _bindToPort = (port?: number) => {
    if (!port) {
      return true;
    }
    const host = Buffer.from('0.0.0.0' + '\0', 'utf-8');
    return bindServerAddress(socketDescriptor, ptr(host), port);
  };

  const socket: UPDSocket = {
    close() {
      if (closed) {
        return;
      }
      closeUDPClientSocket(socketDescriptor);
      closed = true;
    },

    send(params) {
      const hostptr = Buffer.from(`${params.host}\0`, "utf8");
      const address = createServerConnectionAddress(ptr(hostptr), params.port);
      const msg = Buffer.from(`${params.message}\0`, 'utf-8');
      clientSend(socketDescriptor, ptr(msg), params.message.length, address);

      return {
        sucess: true,
      }
    },

    receive({
      timeout = 20000,
      port
    } = {}) {
      return new Promise((resolve, reject) => {
        const bufferSizeInBytes = 1000;
        const udpServerWorker = new Worker(import.meta.dir + "/socket.sworker.ts");

        if (!_bindToPort(port)) {
          udpServerWorker.terminate();
          reject({
            message: 'Failed to bind'
          });
          return;
        }

        const timeoutID = setTimeout(() => {
          /// envia uma mensagem para desbloquear a therad
          this.send({
            host: '127.0.0.1',
            port: 25,
            message: "unblock"
          });
          /// encerra a thead
          udpServerWorker.terminate();
          // returna
          reject({
            message: 'timeout'
          });
          return;
        }, timeout);

        udpServerWorker.onmessage = (event) => {
          // limpa o timeout
          clearTimeout(timeoutID);
          const res = ((event.data ?? {}) as { sucess: boolean }).sucess;
          // retrona
          udpServerWorker.terminate();

          if (!res) {
            reject({
              message: 'teve algum erro'
            });
            return;
          }

          resolve('mensagem recebida ainda não implementada');
          return;
        }

        udpServerWorker.postMessage({
          socketDescriptor,
          bufferSizeInBytes,
        });
      });
    },
  }

  return socket;
}

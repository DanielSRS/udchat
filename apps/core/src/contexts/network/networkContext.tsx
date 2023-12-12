import React, { useEffect, useRef, useState } from 'react';
import { createContext } from 'use-context-selector';
// import { logger } from '../../services/log/logService';
import nodejs from '../../services/node/nodejs';
import { NetworkStats, NewMessageEvent, SendMessageEvent, SendMessageResponseEvent } from './networkEventTypes';
import { BufferLib } from '../../libs/buffer/bufferLib';

const NETWORK_CHANNEL_NAME = 'network';

interface NetworkContextProps {
  networkStats: NetworkStats;
  sendMessage: (params: {
    message: string;
    ip: string;
    port: number;
}) => Promise<SendMessageResponseEvent>
}

export const NetworkContext = createContext({} as NetworkContextProps);

const networkContextData = (): NetworkContextProps => {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalBytesReceived: 0,
    totalBytesSent: 0,
    totalPacketsReceived: 0,
    totalPacketsSent: 0,
    failedMessages: 0,
  });
  const sentMessagesCallbacks = useRef<{
    [key: string]: (res: SendMessageResponseEvent) => void;
  }>({});

  useEffect(() => {
    const propagateNetworkEvent = (event: NewMessageEvent | SendMessageResponseEvent) => {
      if (event.type === 'newMessage') {
        setNetworkStats(s => {
          return {
            ...s,
            totalBytesReceived: s.totalBytesReceived + event.data.info.size,
            totalPacketsReceived: s.totalPacketsReceived + 1,
          }
        });

        processNewMessage(event);
      }
      if (event.type === 'sendMessageResponse') {
        /** Dispara o callback de resposta */
        sentMessagesCallbacks.current[event.data.messageId]?.(event);

        if (event.data.sucess) {
          setNetworkStats(s => {
            return {
              ...s,
              totalBytesSent: s.totalBytesSent + event.data.bytesSent,
              totalPacketsSent: s.totalPacketsSent + 1,
            }
          });
        } else {
          setNetworkStats(s => ({...s, failedMessages: s.failedMessages + 1}));
        }
      }
      // console.log(JSON.stringify({ event: event }, null, 2));
    }

    nodejs.channel.addListener(NETWORK_CHANNEL_NAME, propagateNetworkEvent as (msg: unknown) => void);

    return () => {
      // nodejs?.channel?.removeListener(NETWORK_CHANNEL_NAME, propagateNetworkEvent);
      console.log('listner removido??');
      // clearInterval(interval);
    }
  }, []);

  const sendMessage = async (params: {
    message: string;
    ip: string;
    port: number;
  }) => new Promise<SendMessageResponseEvent>((resolve) => {
    {
      const { ip, message, port } = params;
  
      /** Identifica o envento de resposta de envio de mensage */
      const messageId = `${ip}${port}${(new Date()).getTime().toString(36)}${message.length}`;

      /** Registra o evento de timeout */
      const timeoutResponse: SendMessageResponseEvent['data'] = {
        bytesSent: 0,
        error: new Error('message timedout'),
        logs: ['callback was not fired'],
        messageId,
        sucess: false,
      }
      const timeout = setTimeout(() => {
        resolve({
          type: 'sendMessageResponse',
          data: timeoutResponse,
        });
      }, 10000);

      /** Registra o callback */
      sentMessagesCallbacks.current[messageId] = (r) => { 
        clearTimeout(timeout);
        resolve(r);
      }
  
      /** Dispara evento de envio de mensagem */
      nodejs.channel.post('network', {
        type: 'sendMessage',
        data: {
          ip,
          message: { message, encoding: 'utf8' },
          messageId,
          port,
        },
      } satisfies SendMessageEvent);
    }
  })

  return {
    networkStats,
    sendMessage,
  };
}

export const NetworkProvider = ({ children }: { children: React.ReactElement }) => {
  const contextData = networkContextData();

  return (
    <NetworkContext.Provider value={contextData}>
      {children}
    </NetworkContext.Provider>
  );
}

const processNewMessage = (event: NewMessageEvent) => {
  const msg = BufferLib.from(event.data.message.data, event.data.message.enconding).toString().split('\r\n');
  
  const p = msg[0] && msg[1]
  ? {
    header: JSON.parse(msg[0]),
    body: JSON.parse(msg[1]),
  }
  : {
    header: {},
    body: {},
  }

  console.log(JSON.stringify(p, null, 2));
}

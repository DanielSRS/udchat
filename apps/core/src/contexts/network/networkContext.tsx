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
  }) => Promise<SendMessageResponseEvent>;
  listenForMessagesWith: (params: {
    commitId: string | string[];
    callback: (msg: unknown) => void;
  }) => void;
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
  const messageListners = useRef<{
    [key: string]: Array<(event: unknown) => void>;
  }>({});

  useEffect(() => {
    const unknownMessagesHandler = (msg: unknown) => {
      console.log(`unknownMessagesHandler: ${JSON.stringify(msg, null, 2)}`)
    };
    messageListners.current['unknown'] = [unknownMessagesHandler];
    const propagateNetworkEvent = (event: NewMessageEvent | SendMessageResponseEvent) => {
      if (event.type === 'newMessage') {
        setNetworkStats(s => {
          return {
            ...s,
            totalBytesReceived: s.totalBytesReceived + event.data.info.size,
            totalPacketsReceived: s.totalPacketsReceived + 1,
          }
        });

        const msg = processNewMessage(event);

        // dispatch to listners // 
        const listners = messageListners.current[msg.header.commitId];
        if (listners) {
          listners.map((listner) => listner(msg.body));
        } else {
          console.log(`defaultMessagesHandler: ${JSON.stringify(msg, null, 2)}`);
        }
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

  const _listenForMessagesWith = (params: { commitId: string, callback: (msg: unknown) => void }) => {
    const commitGroup = messageListners.current[params.commitId];
    if (commitGroup) {
      if (commitGroup.includes(params.callback)) return;
      commitGroup.push(params.callback);
      return;
    }
    messageListners.current[params.commitId] = [params.callback];
  };

  const listenForMessagesWith = ({ callback, commitId }: { commitId: string | string[], callback: (msg: unknown) => void }) => {
    if (Array.isArray(commitId)) {
      commitId.map((id) => _listenForMessagesWith({ commitId: id, callback }));
      return;
    } 
    _listenForMessagesWith({ commitId, callback });
  };

  return {
    networkStats,
    sendMessage,
    listenForMessagesWith,
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

  const errorMessage = {
    header: {
      commitId: 'unknown'
    },
    body: {},
  };

  let p = errorMessage;

  const headerString = msg[0];
  const bodyString = msg[1];

  if (!headerString || !bodyString) {
    return p;
  }

  try {
    const header = JSON.parse(headerString) ?? { commitId: 'unknown' };
    const body = JSON.parse(bodyString);

    if (typeof header?.commitId === 'string') {
      const index = (header.commitId as string).lastIndexOf(':');
      if (index === -1 || index > (header.commitId as string).length - 3) {
        header.commitId = 'malformed';
      } else {
        const commitGroupId = (header.commitId as string).substring(index + 1);
        header.commitId = commitGroupId;
        // console.log('commitGroupId: ', commitGroupId);
      }
    }

    p = {
      header,
      body: {
        ...body,
        data: {
          ...body.data,
          ip: event.data.info.address,
          port: event.data.info.port,
        }
      },
    };
  } catch(e) {
    p = errorMessage;
    console.log('processNewMessage error', JSON.stringify(p, null, 2));
  }

  return p;
}

import React, { useEffect, useState } from 'react';
import { createContext } from 'use-context-selector';
// import { logger } from '../../services/log/logService';
import nodejs from '../../services/node/nodejs';

const NETWORK_CHANNEL_NAME = 'network';

interface NetworkContextProps {
  receivedPackets: number;
}

export const NetworkContext = createContext({} as NetworkContextProps);

const networkContextData = (): NetworkContextProps => {
  const [p, sp] = useState(0);

  useEffect(() => {
    const propagateNetworkEvent = (event: unknown) => {
      sp(b => b + 1);
      console.log(JSON.stringify({ event: event }, null, 2));
    }

    nodejs.channel.addListener(NETWORK_CHANNEL_NAME, propagateNetworkEvent);
    const d = {
      ip: '192.168.1.3',
      message: { message: 'daniel', encoding: 'utf8' },
      messageId: 'lkjsd',
      port: 4322
    } satisfies {
      message: Buffer | { message: string; encoding: BufferEncoding };
      ip: string;
      port: number;
      messageId: string;
    }

    // const interval = setInterval(() => {
    //   nodejs.channel.post('network', {
    //     type: 'sendMessage',
    //     data: d,
    //   });
    // }, 1000);

    return () => {
      // nodejs?.channel?.removeListener(NETWORK_CHANNEL_NAME, propagateNetworkEvent);
      console.log('listner removido??');
      // clearInterval(interval);
    }
  }, []);

  return {
    receivedPackets: p,
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

import React, { useEffect, useState } from 'react';
import { createContext } from 'use-context-selector';
// import { logger } from '../../services/log/logService';
import nodejs from '../../services/node/nodejs';

const NETWORK_CHANNEL_NAME = 'serverWorker';

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

    return () => {
      // nodejs?.channel?.removeListener(NETWORK_CHANNEL_NAME, propagateNetworkEvent);
      console.log('listner removido??');
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

import React from 'react';
import { createContext } from 'use-context-selector';

interface NetworkContextProps {
  //
}

export const NetworkContext = createContext({} as NetworkContextProps);

const networkContextData = (): NetworkContextProps => {
  return {};
}

export const NetworkProvider = ({ children }: { children: React.ReactElement }) => {
  const contextData = networkContextData();

  return (
    <NetworkContext.Provider value={contextData}>
      {children}
    </NetworkContext.Provider>
  );
}

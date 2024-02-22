import React from 'react';
import { createContext } from 'use-context-selector';
import { initNodeService } from '../../services/node/nodeService';
import { native } from './platform';

initNodeService(native);

interface ConfigContextProps {
  appVersion: string;
}

export const ConfigContext = createContext({} as ConfigContextProps);

const ConfigContextData = (): ConfigContextProps => {
  return {
    appVersion: '0.0.1',
  };
};

export const ConfigProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const data = ConfigContextData();

  return (
    <ConfigContext.Provider value={data}>{children}</ConfigContext.Provider>
  );
};

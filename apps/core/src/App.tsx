import React from 'react';
import { Box, Text } from 'ink';
import { ConfigProvider } from './contexts/config/configContext';
import { NetworkProvider } from './contexts/network/networkContext';
import { NetworkInfo } from './components/networkInfo/networkInfo';

export const App = () => {
  return (
    <ConfigProvider>
      <NetworkProvider>
        <Box flexDirection='column'>
          <NetworkInfo />
        </Box>
      </NetworkProvider>
    </ConfigProvider>
	);
}
import React from 'react';
import { Box, Text } from 'ink';
import { ConfigProvider } from './contexts/config/configContext';
import { NetworkProvider } from './contexts/network/networkContext';
import { NetworkInfo } from './components/networkInfo/networkInfo';
import { UserBox } from './components/userBox/userBox';
import { UserProvider } from './contexts/user/userContext';

export const App = () => {
  return (
    <ConfigProvider>
      <NetworkProvider>
        <UserProvider>
          <Box flexDirection='column'>
            <NetworkInfo />
            <UserBox />
          </Box>
        </UserProvider>
      </NetworkProvider>
    </ConfigProvider>
	);
}

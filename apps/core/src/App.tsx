import React from 'react';
import { Box, Text } from 'ink';
import { ConfigProvider } from './contexts/config/configContext';
import { NetworkProvider } from './contexts/network/networkContext';
import { NetworkInfo } from './components/networkInfo/networkInfo';
import { UserBox } from './components/userBox/userBox';
import { UserProvider } from './contexts/user/userContext';
import { OrgBox } from './components/orgBox/orgBox';
import { OrgProvider } from './contexts/organization/orgContext';

export const App = () => {
  return (
    <ConfigProvider>
      <NetworkProvider>
        <UserProvider>
          <OrgProvider>
            <Box flexDirection='column'>
              <NetworkInfo />
              <UserBox />
              <OrgBox />
            </Box>
          </OrgProvider>
        </UserProvider>
      </NetworkProvider>
    </ConfigProvider>
	);
}

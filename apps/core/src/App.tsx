import React from 'react';
import { Box, Text } from 'ink';
import { ConfigProvider } from './contexts/config/configContext';
import { NetworkProvider } from './contexts/network/networkContext';
import { NetworkInfo } from './components/networkInfo/networkInfo';
import { UserBox } from './components/userBox/userBox';
import { UserProvider } from './contexts/user/userContext';
import { OrgBox } from './components/orgBox/orgBox';
import { OrgProvider } from './contexts/organization/orgContext';
import { Router } from './routes/router';

export const App = () => {
  return (
    <ConfigProvider>
      <NetworkProvider>
        <UserProvider>
          <OrgProvider>
            <Router />
          </OrgProvider>
        </UserProvider>
      </NetworkProvider>
    </ConfigProvider>
	);
}

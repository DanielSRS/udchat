import React from 'react';
import { ConfigProvider } from './contexts/config/configContext';
import { NetworkProvider } from './contexts/network/networkContext';
import { UserProvider } from './contexts/user/userContext';
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
};

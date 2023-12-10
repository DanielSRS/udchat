import React from 'react';
import { Box } from 'ink';
import { ConfigProvider } from './contexts/config/configContext';
import { AppVersion } from './components/appVersion/appVersion';

export const App = () => {
  return (
    <ConfigProvider>
      <Box justifyContent='space-between' flexDirection='column' >
        <AppVersion />
      </Box>
    </ConfigProvider>
	);
}

import React from 'react';
import { Box, Text } from 'ink';
import { ConfigProvider } from './contexts/config/configContext';
import { AppVersion } from './components/appVersion/appVersion';

export const App = () => {
  return (
    <ConfigProvider>
      <Box flexDirection='column' >
        <AppVersion />
        <Box borderColor={'magenta'} borderStyle={'round'} justifyContent='space-between'>
          <Text>sobreposto</Text>
          <Box marginBottom={-2}>
            <Text  color={'magentaBright'}>10:20:99</Text>
          </Box>
        </Box>
      </Box>
    </ConfigProvider>
	);
}

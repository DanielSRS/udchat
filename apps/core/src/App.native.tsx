import React from 'react';
import { ConfigProvider } from './contexts/config/configContext';
import { NetworkProvider } from './contexts/network/networkContext';
import { StartupPage } from './pages/startup/startupPage';
import { NetworkInfo } from './components/networkInfo/networkInfo';
import { Text, View } from 'react-native';

export const App = () => {
  return (
    <ConfigProvider>
      <NetworkProvider>
      <View>
        <Text>alguma coisa</Text>
        <NetworkInfo />
      </View>
      </NetworkProvider>
    </ConfigProvider>
	);
}

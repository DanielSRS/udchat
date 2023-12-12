import React from 'react';
import { ConfigProvider } from './contexts/config/configContext';
import { NetworkProvider } from './contexts/network/networkContext';
// import { StartupPage } from './pages/startup/startupPage';
import { NetworkInfo } from './components/networkInfo/networkInfo';
import { Text, View } from 'react-native';
import { UserBox } from './components/userBox/userBox';
import { UserProvider } from './contexts/user/userContext';

export const App = () => {
  return (
    <ConfigProvider>
      <NetworkProvider>
        <UserProvider>
          <View>
            <Text>alguma coisa</Text>
            <NetworkInfo />
            <UserBox />
          </View>
        </UserProvider>
      </NetworkProvider>
    </ConfigProvider>
	);
}

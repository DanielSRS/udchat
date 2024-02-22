import React from 'react';
import { View } from 'react-native';
import { NetworkInfo } from '../../components/networkInfo/networkInfo';
import { UserBox } from '../../components/userBox/userBox';
import { OrgBox } from '../../components/orgBox/orgBox';
// import { storageService } from '../../services/storage';
import { IpAddresses } from '../../components/ipaddresses/ipAddresses';

// const userStorage = storageService
//   .withInstanceID('user')
//   .withEncryption()
//   .initialize();

export const StatsPage = () => {
  return (
    <View>
      <NetworkInfo />
      <UserBox />
      <OrgBox />
      <IpAddresses />
    </View>
  );
};

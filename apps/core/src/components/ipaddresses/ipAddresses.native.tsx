import React, { useEffect, useState } from 'react';
import { NET, getNetworkInterfaces } from '../../services/node/nodeService';
import { Text, View } from 'react-native';

export const IpAddresses = () => {
  const [interfaces, setInterfaces] = useState<NET['interfaces']>();

  useEffect(() => {
    const loadInterfaces = async () => {
      const ips = await getNetworkInterfaces();
      setInterfaces(ips.interfaces);
    };

    loadInterfaces();
  }, []);

  if (!interfaces) {
    return null;
  }

  const names = Object.keys(interfaces);

  return (
    <View style={{ borderWidth: 1, borderColor: 'yellow' }}>
      {names.map((int, index) => {
        return (
          <View key={index + ''}>
            <Text>{`${int}`}</Text>
            {interfaces[int]?.map((ip, i) => {
              return <Text key={i + ''}>{`    ${ip}`}</Text>;
            })}
          </View>
        );
      })}
    </View>
  );
};

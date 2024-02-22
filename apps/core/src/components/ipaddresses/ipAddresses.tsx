import React, { useEffect, useState } from 'react';
import { NET, getNetworkInterfaces } from '../../services/node/nodeService';
import { Box, Text } from 'ink';

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
    <Box flexDirection="column" borderColor={'yellow'} borderStyle={'round'}>
      {names.map((int, index) => {
        return (
          <Box key={index + ''} flexDirection="column">
            <Text>{`${int}`}</Text>
            {interfaces[int]?.map((ip, i) => {
              return <Text key={i + ''}>{`    ${ip}`}</Text>;
            })}
          </Box>
        );
      })}
    </Box>
  );
};

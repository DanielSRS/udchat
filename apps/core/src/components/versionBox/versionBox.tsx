import React from 'react';
import { Box, Text } from 'ink';

export const VersionBox = ({ version }: { version: string }) => {
  return (
    <Box borderColor={'yellow'} borderStyle={'round'}>
      <Text backgroundColor={'pink'}>{version}</Text>
    </Box>
  );
};

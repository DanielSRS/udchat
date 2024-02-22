import React from 'react';
import { Box, Text } from 'ink';
import { useUser } from '../../hooks/useUser';

export const UserBox = () => {
  const user = useUser();
  return (
    <Box borderColor={'green'} borderStyle={'round'} flexDirection="column">
      <Text>{`nome: ${user.member.name}`}</Text>
      <Text>{`username: ${user.member.username}`}</Text>
    </Box>
  );
};

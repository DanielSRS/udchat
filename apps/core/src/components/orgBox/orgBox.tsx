import React from 'react';
import { Box, Text } from 'ink';
import { useOrg } from '../../hooks';
import { getCommitsInOrder } from '../../models/commitHistory';

export const OrgBox = () => {
  const org = useOrg();
  return (
    <Box borderColor={'magenta'} borderStyle={'round'} flexDirection="column">
      <Text>{`| Data de criação: ${org.creationDate}`}</Text>
      <Text>{'| Commits:'}</Text>
      {getCommitsInOrder(org.commits).map(item => {
        return (
          <Text
            key={
              item.data.commitId
            }>{`|     ${item.type}: ${item.data.commitId}`}</Text>
        );
      })}
      <Text>{'| membros:'}</Text>
      {org.members.map(item => {
        return (
          <Text
            key={
              item.username
            }>{`|    ${item.username} aka ${item.name}`}</Text>
        );
      })}
    </Box>
  );
};

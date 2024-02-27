import React from 'react';
import { useOrg } from '../../hooks';
import { Text, View } from 'react-native';
import { getCommitsInOrder } from '../../models/commitHistory';

export const OrgBox = () => {
  const org = useOrg();
  return (
    <View style={{ borderWidth: 1, borderColor: 'magenta' }}>
      <Text>{`| Data de criação: ${org.creationDate}`}</Text>
      <Text>{'| Commits:'}</Text>
      {getCommitsInOrder(org.commits).map(item => {
        const time = new Date(0);
        const timeInMs = parseInt(item.data.createdAt, 36);
        time.setUTCMilliseconds(timeInMs);
        return (
          <Text key={item.data.commitId}>{`|     ${
            item.type
          }: ${item.data.commitId}`}</Text>
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
    </View>
  );
};

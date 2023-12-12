import React from "react";
import { useOrg } from "../../hooks";
import { Text, View } from "react-native";

export const OrgBox = () => {
  const org = useOrg();
  return (
    <View style={{ borderWidth: 1, borderColor: 'magenta' }}>
      <Text>{`| Data de criação: ${org.creationDate}`}</Text>
      <Text>{`| Commits:`}</Text>
      {org.commits.map((item) => {
        return (
          <Text key={item.createdAt} >{`|     ${item.type}: ${item.createdAt}`}</Text>
        );
      })}
      <Text>{`| membros:`}</Text>
      {org.members.map((item) => {
        return (
          <Text key={item.username} >{`|    ${item.username} aka ${item.name}`}</Text>
        );
      })}
    </View>
  );
};

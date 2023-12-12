import React from "react";
import { useUser } from "../../hooks/useUser";
import { Text, View } from "react-native";

export const UserBox = () => {
  const user = useUser();
  return (
    <View style={{ borderWidth: 1, borderColor: 'green' }}>
      <Text >{`nome: ${user.member.name}`}</Text>
      <Text >{`username: ${user.member.username}`}</Text>
    </View>
  );
};

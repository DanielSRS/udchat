import React from "react";
import { useContextSelector } from "use-context-selector";
import { NetworkContext } from "../../contexts/network/networkContext";
import { Text, View } from "react-native";

export const NetworkInfo = () => {
  const count = useContextSelector(NetworkContext, data => data.receivedPackets);
  return (
    <View style={{ borderWidth: 1 }}>
      <Text>
        {count}
      </Text>
    </View>
  );
};

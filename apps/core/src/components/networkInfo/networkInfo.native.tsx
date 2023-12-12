import React from "react";
import { useContextSelector } from "use-context-selector";
import { NetworkContext } from "../../contexts/network/networkContext";
import { Text, View } from "react-native";

export const NetworkInfo = () => {
  const networkStats = useContextSelector(NetworkContext, data => data.networkStats);
  return (
    <View style={{ borderWidth: 1 }}>
      <Text>{`totalBytesReceived:       ${networkStats.totalBytesReceived}`}</Text>
      <Text>{`totalBytesSent:           ${networkStats.totalBytesSent}`}</Text>
      <Text>{`totalPacketsReceived:     ${networkStats.totalPacketsReceived}`}</Text>
      <Text>{`totalPacketsSent:         ${networkStats.totalPacketsSent}`}</Text>
      <Text>{`failedMessages:           ${networkStats.failedMessages}`}</Text>
    </View>
  );
};

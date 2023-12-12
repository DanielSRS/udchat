import React from "react";
import { Box, Text } from "ink";
import { useContextSelector } from "use-context-selector";
import { NetworkContext } from "../../contexts/network/networkContext";

export const NetworkInfo = () => {
  const networkStats = useContextSelector(NetworkContext, data => data.networkStats);
  return (
    <Box borderColor={'white'} borderStyle={'round'} flexDirection="column">
      <Text>{`totalBytesReceived:       ${networkStats.totalBytesReceived}`}</Text>
      <Text>{`totalBytesSent:           ${networkStats.totalBytesSent}`}</Text>
      <Text>{`totalPacketsReceived:     ${networkStats.totalPacketsReceived}`}</Text>
      <Text>{`totalPacketsSent:         ${networkStats.totalPacketsSent}`}</Text>
      <Text>{`failedMessages:           ${networkStats.failedMessages}`}</Text>
    </Box>
  );
};

import React from "react";
import { Box, Text } from "ink";
import { useContextSelector } from "use-context-selector";
import { NetworkContext } from "../../contexts/network/networkContext";

export const NetworkInfo = () => {
  const count = useContextSelector(NetworkContext, data => data.receivedPackets);
  return (
    <Box borderColor={'white'} borderStyle={'round'}>
      <Text backgroundColor={'pink'}>
        {count}
      </Text>
    </Box>
  );
};

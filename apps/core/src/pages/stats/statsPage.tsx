import React from "react";
import { Box } from "ink";
import { NetworkInfo } from "../../components/networkInfo/networkInfo";
import { UserBox } from "../../components/userBox/userBox";
import { OrgBox } from "../../components/orgBox/orgBox";
import { IpAddresses } from "../../components/ipaddresses/ipAddresses";

export const StatsPage = () => {
  return (
    <Box flexDirection='column'>
      <NetworkInfo />
      <UserBox />
      <OrgBox />
      <IpAddresses />
    </Box>
  );
}
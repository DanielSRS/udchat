import React from "react";
import { View } from "react-native";
import { NetworkInfo } from "../../components/networkInfo/networkInfo";
import { UserBox } from "../../components/userBox/userBox";
import { OrgBox } from "../../components/orgBox/orgBox";

export const StatsPage = () => {
  return (
    <View>
      <NetworkInfo />
      <UserBox />
      <OrgBox />
    </View>
  );
}
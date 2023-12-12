import React from "react";
import { View } from "react-native";
import { MessageTextContent } from "../../components/messageTextContent/messageTextContent";

export const ChatPage = () => {
  return (
    <View style={{ gap: 10 }}>
      {/*  */}
      <MessageTextContent text="çlaskdjflaskjdf alskdf açsldk falsdkfj asdlçkfj asldkfj" />
      <MessageTextContent self={true} text="olha so hoej laskjd flç çaslkf lsdfklsdjflkj oweieuro kkkkkkkkkkkkkkkkkkkk" />
    </View>
  );
}

import React from "react";
import { Box } from "ink";
import { MessageTextContent } from "../../components/messageTextContent/messageTextContent";

export const ChatPage = () => {
  return (
    <Box flexDirection="column" width={'100%'}>
      {/*  */}
      <MessageTextContent text="çlaskdjflaskjdf alskdf açsldk falsdkfj asdlçkfj asldkfj" />
      <MessageTextContent self={true} text="olha so hoej laskjd flç çaslkf lsdfklsdjflkj oweieuro kkkkkkkkkkkkkkkkkkkk" />
    </Box>
  );
}

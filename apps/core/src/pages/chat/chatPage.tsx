import React from "react";
import { Box } from "ink";
import { MessageTextContent } from "../../components/messageTextContent/messageTextContent";

export const ChatPage = () => {
  return (
    <Box flexDirection="column" width={'100%'}>
      {/*  */}
      <MessageTextContent
        text="çlaskdjflaskjdf alskdf açsldk falsdkfj asdlçkfj asldkfj"
        senderName="Fofoquiro do bairro"
        sentAt="10:20"
      />
      <MessageTextContent
        self={true}
        text="olha so hoej laskjd flç çaslkf lsdfklsdjflkj oweieuro kkkkkkkkkkkkkkkkkkkk"
        senderName="Daniel santa rosa"
        sentAt="10:20"
      />
    </Box>
  );
}

import React, { useState } from 'react';
import { Box } from 'ink';
import { MessageTextContent } from '../../components/messageTextContent/messageTextContent';
import TextInput from 'ink-text-input';

export const ChatPage = () => {
  const [query, setQuery] = useState('');
  return (
    <Box
      flexDirection="column"
      width={'100%'}
      // borderStyle={'round'}
    >
      <Box
        flexDirection="column"
        width={'100%'}
        height={'100%'}
        // borderStyle={'round'}
        // borderColor={'magenta'}
      >
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
      <Box flexDirection="column" borderStyle={'round'}>
        <TextInput
          value={query}
          onChange={setQuery}
          onSubmit={() => setQuery('')}
        />
      </Box>
    </Box>
  );
};

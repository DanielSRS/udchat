import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { MessageTextContent } from '../../components/messageTextContent/messageTextContent';

export const ChatPage = () => {
  const [query, setQuery] = useState('');
  return (
    <View style={{ flex: 1 }}>
      <View style={{ gap: 10, flex: 1 }}>
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
      </View>
      <View style={{ padding: 10 }}>
        <TextInput
          style={{ borderWidth: 1, borderRadius: 8 }}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setQuery('')}
        />
      </View>
    </View>
  );
};

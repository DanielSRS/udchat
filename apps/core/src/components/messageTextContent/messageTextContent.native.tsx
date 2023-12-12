import React from "react";
import { Text, View } from "react-native";

interface MessageTextContentProps {
  text: string;
  /** Se fui eu quem enviou a mensagem, a bolha é posicionada na direita */
  self?: boolean;
}

export const MessageTextContent = (params: MessageTextContentProps) => {
  const { text, self = false} = params;
  const textLines = text.split('\n');
  return (
    // container
    <View style={{ width: '100%' }}>
      <View style={{
        borderWidth: 1,
        borderColor: 'black',
        padding: 8,
        borderRadius: 4,
        maxWidth: '70%',
        alignSelf: self ? 'flex-end' : 'flex-start',
      }}>
        {textLines.map((line, index) => (
          <Text key={index + ''}>{line}</Text>
        ))}
      </View>
    </View>
  );
}
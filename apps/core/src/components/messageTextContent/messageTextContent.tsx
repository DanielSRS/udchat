import React from "react";
import { Box, Text } from "ink";

interface MessageTextContentProps {
  text: string;
  /** Se fui eu quem enviou a mensagem, a bolha é posicionada na direita */
  self?: boolean;
  /** Nome de quem enviou a mensage */
  senderName: string;
  /** hora de envio */
  sentAt: string;
}

export const MessageTextContent = (params: MessageTextContentProps) => {
  const { text, self = false, senderName, sentAt } = params;
  const textLines = text.split('\n');
  return (
    // container
    <Box width={'100%'} flexDirection="column">
      {self ? null : <Text backgroundColor={'greenBright'}>{` ${senderName} `}</Text>}
      <Box
        width={'70%'}
        borderStyle={'round'}
        borderColor={'black'}
        alignSelf={self ? 'flex-end' : 'flex-start'}
      >
        {textLines.map((line, index) => (
          <Text key={index + ''}>{line}</Text>
        ))}
      </Box>
      <Box alignSelf={self ? 'flex-end' : 'flex-start'}>
        <Text>{`${sentAt}`}</Text>
      </Box>
    </Box>
  );
}
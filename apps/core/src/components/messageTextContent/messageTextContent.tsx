import React from "react";
import { Box, Text } from "ink";

interface MessageTextContentProps {
  text: string;
  /** Se fui eu quem enviou a mensagem, a bolha é posicionada na direita */
  self?: boolean;
}

export const MessageTextContent = (params: MessageTextContentProps) => {
  const { text, self } = params;
  const textLines = text.split('\n');
  return (
    // container
    <Box width={'100%'} flexDirection="column">
      <Box width={'70%'} borderStyle={'round'} borderColor={'black'} alignSelf={self ? 'flex-end' : 'flex-start'}>
        {textLines.map((line, index) => (
          <Text key={index + ''}>{line}</Text>
        ))}
      </Box>
    </Box>
  );
}
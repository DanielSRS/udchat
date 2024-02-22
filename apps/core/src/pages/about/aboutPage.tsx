import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';

export const AboutPage = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(previousCounter => previousCounter + 1);
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Box justifyContent="space-between" flexDirection="column">
      <Text color="green">{counter} tests passed</Text>
      <Text color="blue">bottom</Text>
    </Box>
  );
};

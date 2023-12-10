import React, { useEffect, useState } from 'react';
import {render, Box, useStdout, Text} from 'ink';
import { StartupPage } from '@udchat/core';

// clear screen before using the app. This is to be able to use the hole terminal area without previos text
const clearScreen = () => console.log("\x1b[2J\x1b[H");
clearScreen();

const useStdoutDimensions = (): [number, number] => {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState<[number, number]>([stdout.columns, stdout.rows]);

  useEffect(() => {
    const handler = () => {
			setDimensions([stdout.columns, stdout.rows]);
		};
    stdout.on('resize', handler);
    return () => {
      stdout.off('resize', handler);
    };
  }, [stdout]);

  return dimensions;
}

const RootView = ({ children }: { children?: React.ReactElement }) => {
	const [c, r] = useStdoutDimensions();
	return (
		<Box height={r - 1} width={c - 1} borderStyle={'round'} borderColor={'red'} flexDirection='column'>
			<Text>{`c: ${c} - r: ${r}`}</Text>
			{children}
		</Box>
	);
}

render(<RootView children={<StartupPage />} />, { patchConsole: true });

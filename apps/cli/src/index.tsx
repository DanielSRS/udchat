import React from 'react';
import {render, Box} from 'ink';
import { StartupPage } from '@udchat/core';

// clear screen before using the app. This is to be able to use the hole terminal area without previos text
const clearScreen = () => console.log("\x1b[2J\x1b[H");
clearScreen();

const RootView = ({ children }: { children?: React.ReactElement }) => {
	return (
		<Box height={36} borderStyle={'round'} borderColor={'red'}>
			{children}
		</Box>
	);
}

render(<RootView children={<StartupPage />} />, { patchConsole: true });

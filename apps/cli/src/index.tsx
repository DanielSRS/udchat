// import { startup } from '@udchat/core/src/pages/startup';
import { AboutPage } from '@udchat/core';

// // startup()
// renderAboutPage();
import React, {useState, useEffect} from 'react';
import {render, Text, Box, useStdout} from 'ink';

// clear screen before using the app. This is to be able to use the hole terminal area without previos text
const clearScreen = () => console.log("\x1b[2J\x1b[H");
clearScreen();

const Counter = () => {
	const [counter, setCounter] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setCounter(previousCounter => previousCounter + 1);
		}, 100);

		return () => {
			clearInterval(timer);
		};
	}, []);

	// return ('meybe');
	return (
		<Box justifyContent='space-between' flexDirection='column' >
			<Text color="green">{counter} tests passed</Text>
			<Text color="blue">bottom</Text>
		</Box>
	);
};

export const useDimensions = () => {
	const [columns, setColumns] = useState(process.stdout.columns);
	const [rows, setRows] = useState(process.stdout.rows);
	const { write } = useStdout();

	useEffect(() => {
		const updateOnSizeChange = () => {
			const newColumns = process.stdout.columns;
			const newRows = process.stdout.rows;
			write(`Size changed: `);
			setColumns(c => {
				console.log(`columns changed from ${c} to ${newColumns}`);
				return newColumns;
			});
			setRows(r => {
				console.log(`columns changed from ${r} to ${newRows}`);
				return newRows;
			});
			
		}


		process.stdout.on('resize', updateOnSizeChange);

		return () => {
			process.stdout.removeListener('resize', updateOnSizeChange);
		}
	}, []);

	useEffect(() => {
		write(`initial vals: c: ${process.stdout.columns} - r: ${process.stdout.rows}`)
	}, []);

	return { columns, rows };
}

const RootView = ({ children }: { children?: React.ReactElement }) => {
	return (
		<Box height={36} borderStyle={'round'} borderColor={'red'}>
			{children}
		</Box>
	);
}
render(<RootView children={<AboutPage />} />);


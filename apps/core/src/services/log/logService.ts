import {
  configLoggerType,
  // consoleTransport,
  transportFunctionType,
} from 'react-native-logs';
import { createLogger } from './logger';

const inkConsoleTransporter: transportFunctionType = item => {
  console.log(item.msg);
};

const defaultLoggerConfig: configLoggerType = {
  // levels: {
  //   debug: 0,
  //   info: 1,
  //   warn: 2,
  //   error: 3,
  // },
  // severity: "debug",
  transport: inkConsoleTransporter,
  transportOptions: {
    colors: {
      debug: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
  },
  // async: true,
  // dateFormat: 'time',
  // printLevel: true,
  // printDate: true,
  // enabled: true,
};

export const logger = createLogger(defaultLoggerConfig);

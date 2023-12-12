import { consoleTransport } from "react-native-logs";
import { createLogger } from "./logger";

const defaultLoggerConfig = {
  // levels: {
  //   debug: 0,
  //   info: 1,
  //   warn: 2,
  //   error: 3,
  // },
  // severity: "debug",
  transport: consoleTransport,
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

import { configLoggerType, logger as lg } from 'react-native-logs';

export type LoggedOject = Object | number | string;
export type ConcatLogMessage = LoggedOject[];
export type LogMessage = string | Object;

export interface LogFunctions {
  debug: (log: LogMessage, ...optional: ConcatLogMessage) => void;
  error: (log: LogMessage, ...optional: ConcatLogMessage) => void;
  info: (log: LogMessage, ...optional: ConcatLogMessage) => void;
  warn: (log: LogMessage, ...optional: ConcatLogMessage) => void;
}

export interface Logger extends LogFunctions {
  extend: (name: string) => LogFunctions;
}

export const createLogger = (config?: configLoggerType): Logger =>
  lg.createLogger(config);

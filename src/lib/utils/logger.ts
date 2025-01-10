import winston from 'winston';

const {combine, timestamp, printf, colorize, errors} = winston.format;

const customFormat = printf(({level, message, timestamp, stack}) => {
  return `[${timestamp}] [${level}] ${stack || message}`;
});

const createLogger = ({filename = 'cronjob.log'}: { filename?: string }) => winston.createLogger({
  level: 'info',
  format: combine(
    errors({stack: true}),
    timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    customFormat
  ),
  transports: [
    // 1) Console
    new winston.transports.Console({
      format: combine(colorize(), customFormat),
    }),
    // 2) File
    new winston.transports.File({filename}),
  ],
});

export default createLogger;

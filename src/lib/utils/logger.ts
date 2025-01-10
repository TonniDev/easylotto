import winston from 'winston';

const {combine, timestamp, printf, colorize, errors} = winston.format;

const customFormat = printf(({level, message, timestamp, stack}) => {
  // If there's a stack, include it in the message
  return `[${timestamp}] [${level}] ${stack || message}`;
});

const createLogger = ({filename = 'cronjob.log'}: { filename?: string }) => winston.createLogger({
  level: 'info',
  format: combine(
    errors({stack: true}),            // <— capture stack traces
    timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    customFormat
  ),
  transports: [
    // 1) Console
    new winston.transports.Console({
      format: combine(colorize(), customFormat),
    }),
    // 2) File (optional)
    new winston.transports.File({filename}),
  ],
});

export default createLogger;

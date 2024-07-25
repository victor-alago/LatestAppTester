import winston from 'winston';
import { Writable } from 'stream';

const options = {
  file: {
    level: "info",
    filename: `./logs/app.log`,
    handleExceptions: true,
    maxsize: 5242880, // about 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  },
  console: {
    level: "debug",
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  },
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

const morganStream = new Writable({
  write: (chunk, _, callback) => {
    logger.info(chunk.toString().trim());
    callback();
  },
});

export { logger, morganStream };
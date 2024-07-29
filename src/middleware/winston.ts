import { createLogger, transports, format, LoggerOptions } from 'winston';

interface Options {
    file: {
        level: string;
        filename: string;
        handleExceptions: boolean;
        maxSize: number;
        maxFiles: number;
        format: LoggerOptions['format'];
    };
    console: {
        level: string;
        handleExceptions: boolean;
        format: LoggerOptions['format'];
    };
}

const options: Options = {
    file: {
        level: 'info',
        filename: './logs/app.log',
        handleExceptions: true,
        maxSize: 5242880, // about 5MB
        maxFiles: 5,
        format: format.combine(format.timestamp(), format.json()),
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        format: format.combine(format.colorize(), format.simple()),
    },
};

const logger = createLogger({
    transports: [
        new transports.File(options.file),
        new transports.Console(options.console),
    ],
    exitOnError: false,
});

export default logger;
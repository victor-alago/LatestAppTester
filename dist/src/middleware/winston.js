"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const options = {
    file: {
        level: 'info',
        filename: './logs/app.log',
        handleExceptions: true,
        maxSize: 5242880,
        maxFiles: 5,
        format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
    },
};
const logger = (0, winston_1.createLogger)({
    transports: [
        new winston_1.transports.File(options.file),
        new winston_1.transports.Console(options.console),
    ],
    exitOnError: false,
});
exports.default = logger;
//# sourceMappingURL=winston.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const stream_1 = require("stream");
const options = {
    file: {
        level: "info",
        filename: `./logs/app.log`,
        handleExceptions: true,
        maxsize: 5242880,
        maxFiles: 5,
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    },
    console: {
        level: "debug",
        handleExceptions: true,
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    },
};
const logger = winston_1.default.createLogger({
    transports: [
        new winston_1.default.transports.File(options.file),
        new winston_1.default.transports.Console(options.console),
    ],
    exitOnError: false,
});
exports.logger = logger;
const morganStream = new stream_1.Writable({
    write: (chunk, _, callback) => {
        logger.info(chunk.toString().trim());
        callback();
    },
});
exports.morganStream = morganStream;
//# sourceMappingURL=winston.js.map
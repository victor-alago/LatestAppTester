import winston from 'winston';
import { Writable } from 'stream';
declare const logger: winston.Logger;
declare const morganStream: Writable;
export { logger, morganStream };

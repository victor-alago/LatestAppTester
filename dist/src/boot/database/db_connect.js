"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("../../middleware/winston"));
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const db_config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
    max: 1,
};
let db_connection;
function startConnection() {
    pg_1.types.setTypeParser(1082, function (stringValue) {
        return stringValue;
    });
    db_connection = new pg_1.Pool(db_config);
    db_connection.connect((err, client) => {
        if (!err) {
            winston_1.default.info('PostgreSQL Connected');
        }
        else {
            winston_1.default.error('PostgreSQL Connection Failed ');
            db_connection.on('error', (err) => {
                winston_1.default.error('Unexpected error on idle client', err);
            });
        }
        client.release();
    });
}
startConnection();
exports.default = db_connection;
//# sourceMappingURL=db_connect.js.map
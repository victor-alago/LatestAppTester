"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const winston_1 = require("../../middleware/winston");
const db_config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
    max: 10,
};
let db_connection;
function startConnection() {
    pg_1.types.setTypeParser(1082, (stringValue) => {
        return stringValue;
    });
    db_connection = new pg_1.Pool(db_config);
    db_connection.connect((err) => {
        if (!err) {
            winston_1.logger.info("PostgreSQL Connected");
        }
        else {
            winston_1.logger.error("PostgreSQL Connection Failed");
        }
    });
    db_connection.on("error", (err) => {
        winston_1.logger.error("Unexpected error on idle client", err);
        startConnection();
    });
}
startConnection();
exports.default = db_connection;
//# sourceMappingURL=db_connect.js.map
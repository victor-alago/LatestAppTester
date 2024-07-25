import { Pool, types } from "pg";
import { logger } from "../../middleware/winston";

const db_config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  max: 10,
};

let db_connection: Pool;

function startConnection(): void {
  // type parsers here
  types.setTypeParser(1082, (stringValue: string): string => {
    return stringValue; // 1082 is for date type
  });

  db_connection = new Pool(db_config);

  db_connection.connect((err) => {
    if (!err) {
      logger.info("PostgreSQL Connected");
    } else {
      logger.error("PostgreSQL Connection Failed");
    }
  });

  db_connection.on("error", (err) => {
    logger.error("Unexpected error on idle client", err);
    startConnection();
  });
}

startConnection();

export default db_connection;
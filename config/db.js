import mysql2 from "mysql2/promise";
import { configDotenv } from "dotenv";
configDotenv();

const pool = mysql2.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
});

export default pool;

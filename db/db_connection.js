import mysql from "mysql2";
import "dotenv/config";
const host = process.env.HOST;
const user = process.env.USER;
const pass = process.env.PASSWORD;
const db = process.env.DB;
const connection = mysql.createConnection({
  host: host,
  user: user,
  password: pass,
  database: db,
});
export { connection };

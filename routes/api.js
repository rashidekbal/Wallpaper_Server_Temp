import express from "express";
import connection from "../db/db_connection.js";
const api = express.Router();
api.get("/link", (req, res) => {
  const q = req.query.q;
  const page = req.query.page;
  const query = `SELECT * FROM links WHERE FIND_IN_SET('${q}',Lower(tags))`;
  connection.query(query, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      res.send(err);
    }
  });
});
export default api;

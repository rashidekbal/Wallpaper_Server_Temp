import express from "express";
import connection from "../db/db_connection.js";
const api = express.Router();
api.get("/link", (req, res) => {
  const q = req.query.q;
  const page = req.query.page;
  const query = q
    ? `SELECT * FROM links WHERE FIND_IN_SET('${q}',Lower(tags))`
    : `SELECT * FROM links limit 100`;
  connection.query(query, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      res.send(err);
    }
  });
});
api.get("/category", (req, res) => {
  const q = "select * from category";
  connection.query(q, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      res.send(err);
    }
  });
});
export default api;

import express from "express";
import connection from "../db/db_connection.js";
const api = express.Router();

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

api.get("/links", (req, res) => {
  let q = null;
  let query = null;
  if (req.query.q) {
    q = req.query.q;
    q.toLowerCase();
    query = `Select * from links where find_in_set(${q},tags)`;
    if (q.split(" ").length) {
      q = q.split(" ");
      query = `Select *from links where find_in_set('${q[0]}',tags)`;
      for (let i = 1; i < q.length; i++) {
        query = query + `or find_in_set('${q[i]}',tags)`;
      }
    }
  } else {
    query = `select * from links`;
  }

  connection.query(query, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      res.send(err);
    }
  });
});
export default api;

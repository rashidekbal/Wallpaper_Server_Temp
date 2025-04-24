import express, { json } from "express";
import "dotenv/config";
import connection from "./db/db_connection.js";
import cors from "cors";
import update from "./routes/update.js";
import api from "./routes/api.js";
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/update", update);
app.use("/api", api);
app.get("/", (req, res) => {
  res.send("working route");
});
connection.connect((err, res) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port, () => {
      console.log("connected to server ");
      console.log(`running on server port ${port} `);
    });
  }
});

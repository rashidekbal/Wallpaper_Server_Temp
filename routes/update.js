import axios from "axios";
import express from "express";
import connection from "../db/db_connection.js";
const router = express.Router();

router.post("/addData", (req, res) => {
  let api = req.body.api;
  axios
    .get(api)
    .then((response) => {
      let array = response.data.hits;
      let values = array.map((item) => {
        let arrayoftags = item.tags.split(" ");
        let tag = "";
        for (let i = 0; i < arrayoftags.length; i++) {
          tag = tag + arrayoftags[i];
        }
        return [
          parseInt(item.id),
          tag,
          item.webformatURL,
          parseInt(item.webformatHeight),
          parseInt(item.webformatWidth),
          item.largeImageURL,
          parseInt(item.imageHeight),
          parseInt(item.imageWidth),
          item.pageURL,
          item.userImageURL,
        ];
      });
      let query =
        "INSERT INTO links (id,	tags,previewLink,previewHeight,previewWidth,largeImage,largeHeight,largeWidth,ref,userImage) VALUES ?";
      connection.query(query, [values], (dberr, dbres) => {
        if (!dberr) {
          res.send(dbres.info);
        } else {
          res.send(dberr.sqlMessage);
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
router.post("/updateList", (req, res) => {
  let link = req.body.api;
  const getquery = `select * from category`;
  connection.query("delete from links", (error, results) => {
    if (!error) {
      connection.query(getquery, (err, result) => {
        if (!err) {
          let list_of_category = result;
          for (let i = 0; i < list_of_category.length; i++) {
            link = `${link}?q=${list_of_category[i]}`;
            axios
              .get(link)
              .then((response) => {
                let array = response.data.hits;

                let values = array.map((item) => {
                  let arrayoftags = item.tags.split(" ");
                  let tag = "";
                  for (let i = 0; i < arrayoftags.length; i++) {
                    tag = tag + arrayoftags[i];
                  }
                  return [
                    parseInt(item.id),
                    tag,
                    item.webformatURL,
                    parseInt(item.webformatHeight),
                    parseInt(item.webformatWidth),
                    item.largeImageURL,
                    parseInt(item.imageHeight),
                    parseInt(item.imageWidth),
                    item.pageURL,
                    item.userImageURL,
                  ];
                });
                let query =
                  "INSERT INTO links (id,	tags,previewLink,previewHeight,previewWidth,largeImage,largeHeight,largeWidth,ref,userImage) VALUES ?";
                connection.query(query, [values], (dberr, dbres) => {});
              })
              .catch((err) => {
                console.log(err);
              });
          }
          res.send("sucess fully updated");
        } else {
          res.send(err.sqlMessage);
        }
      });
    }
  });
});
export default router;

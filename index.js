import express, { json } from "express";
import "dotenv/config";
import { connection } from "./db/db_connection.js";

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is up and running");
});

app.get("/updateDatabase", (req, globalres) => {
  connection.query("delete from wallpapers", (err, back) => {
    if (!err) {
      const wallpaperCategories = [
        "Aesthetic",
        "Abstract",
        "Nature",
        "Forest",
        "Mountains",
        "Beaches",
        "Galaxy",
        "Stars",
        "Futuristic",
        "Cyberpunk",
        "Neon",
        "Anime",
        "Gaming",
        "Pixel+Art",
        "3D",
        "Optical+Illusion",
        "Quotes",
        "Gradient",
        "Kawaii",
        "Cartoons",
        "Food",
        "Christmas",
        "Halloween",
        "Spring",
        "Pop+Culture",
        "Movies",
        "Solid+Colors",
        "Indian+Actress+Beautiful",
      ];
      for (let i = 0; i < wallpaperCategories.length; i++) {
        if (i == wallpaperCategories.length - 1) {
          fetch(
            `https://pixabay.com/api/?key=47570294-7b13d4203e4690bc9b9af1531&q=${wallpaperCategories[i]}&image_type=photo`,
            { method: "GET" }
          )
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              let smaple_data = data.hits;
              const query =
                "INSERT INTO wallpapers (catagory,id,preview_url,image_url) VALUES ?";
              const values = smaple_data.map((item) => [
                `${wallpaperCategories[i]}`,
                item.id,
                item.previewURL,
                item.largeImageURL,
              ]);

              connection.query(query, [values], (err, result) => {
                if (!err) {
                } else {
                  console.log("error occured while inserting the data");
                }
              });
            })
            .catch((err) => {
              console.log("err fetching the data");
            });

          globalres.send("updated all the catagory sucessfully");
        } else {
          fetch(
            `https://pixabay.com/api/?key=47570294-7b13d4203e4690bc9b9af1531&q=${wallpaperCategories[i]}&image_type=photo`,
            { method: "GET" }
          )
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              let smaple_data = data.hits;
              const query =
                "INSERT INTO wallpapers (catagory,id,preview_url,image_url) VALUES ?";
              const values = smaple_data.map((item) => [
                `${wallpaperCategories[i]}`,
                item.id,
                item.previewURL,
                item.largeImageURL,
              ]);

              connection.query(query, [values], (err, result) => {
                if (!err) {
                } else {
                  console.log("error occured while inserting the data");
                }
              });
            })
            .catch((err) => {
              console.log("error occured whilefetching the data ");
            });
        }
      }
    } else {
      globalres.send("error nothing changed ");
    }
  });
});

app.get("/getImages", (req, res) => {
  connection.query("select * from wallpapers", (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      res.send("err occured " + err);
    }
  });
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

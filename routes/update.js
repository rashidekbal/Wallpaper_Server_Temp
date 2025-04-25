import axios from "axios";
import express from "express";
import connection from "../db/db_connection.js";
import "dotenv/config";
const router = express.Router();
let api = process.env.API;

// Route to add data by single category
router.get("/addData", async (req, res) => {
  let flag = req.query.flag;
  let category = req.query.q;
  let page = req.query.page;
  let image_link;
  let link = `${api}&q=${category}&page=${page}`;

  try {
    const idsOnserver = await getIds();

    const { data } = await axios.get(link);
    let array = data.hits;
    image_link = array[0].webformatURL;

    array = array.filter((item) => !idsOnserver.includes(item.id));

    const value = array.map((item) => {
      let arrayoftags = item.tags.split(" ");
      let tag = arrayoftags.join("");
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

    if (flag == 1) {
      await insertCategory(category, image_link);
    }

    const insertResult = await insertLinks(value);
    res.json({ result: insertResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Internal Server Error" });
  }
});

// Route to refresh all category data
router.get("/refreshAllData", async (req, res) => {
  try {
    const categories = await new Promise((resolve, reject) => {
      connection.query("SELECT name FROM category", (err, result) => {
        if (err) reject(err);
        else resolve(result.map((row) => row.name));
      });
    });

    let value = [];

    for (let cat of categories) {
      const link = `${api}&q=${cat}&page=1`;
      const { data } = await axios.get(link);

      // 💥 Update image for category
      const imageLink = data.hits[0]?.webformatURL || "";
      await new Promise((resolve, reject) => {
        connection.query(
          `UPDATE category SET image = ? WHERE name = ?`,
          [imageLink, cat],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const result = data.hits.map((item) => {
        const tag = item.tags.split(" ").join("");
        return {
          id: parseInt(item.id),
          data: [
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
          ],
        };
      });

      value.push(...result);
    }

    const seen = new Set();
    const finalValues = value
      .filter((obj) => {
        if (seen.has(obj.id)) return false;
        seen.add(obj.id);
        return true;
      })
      .map((obj) => obj.data);

    await new Promise((resolve, reject) => {
      connection.query("DELETE FROM links", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (finalValues.length > 0) {
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO links 
          (id, tags, previewLink, previewHeight, previewWidth, largeImage, largeHeight, largeWidth, ref, userImage) 
          VALUES ?`,
          [finalValues],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.json({
      result:
        "✅ All categories refreshed with new images and data inserted 🎯",
    });
  } catch (err) {
    console.error("💥 Error:", err);
    res
      .status(500)
      .json({ result: "😓 Error occurred while refreshing data!" });
  }
});

// Helpers
async function getIds() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT id FROM links", (err, result) => {
      if (err) reject(err);
      else resolve(result.map((item) => item.id));
    });
  });
}

async function insertCategory(category, image_link) {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO category (name, image) VALUES (?, ?)`,
      [category, image_link],
      (err) => {
        if (err) reject("Failed adding category");
        else resolve("Category added");
      }
    );
  });
}

async function insertLinks(value) {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO links 
      (id, tags, previewLink, previewHeight, previewWidth, largeImage, largeHeight, largeWidth, ref, userImage) 
      VALUES ?`,
      [value],
      (err) => {
        if (err) reject("Failed inserting data");
        else resolve("Data inserted");
      }
    );
  });
}

export default router;

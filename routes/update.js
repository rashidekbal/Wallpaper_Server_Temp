import axios from "axios";
import express from "express";
import connection from "../db/db_connection.js";
import "dotenv/config";
const router = express.Router();
let api = process.env.API;

router.get("/addData", async (req, res) => {
  let flag = req.query.flag;
  let category = req.query.q;
  let page = req.query.page;
  let image_link;
  let link = `${api}&q=${category}&page=${page}`;

  try {
    // First get the IDs from the database
    const idsOnserver = await getIds();

    // Fetch data from external API after IDs are fetched
    const { data } = await axios.get(link);
    let array = data.hits;
    image_link = array[0].webformatURL;

    // Filter the array based on IDs not present in the server
    array = array.filter((item) => !idsOnserver.includes(item.id));

    // Map the data to the desired format
    const value = array.map((item) => {
      let arrayoftags = item.tags.split(" ");
      let tag = arrayoftags.join(""); // Join tags without spaces
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

    // Insert category into the database if flag is true
    if (flag == 1) {
      await insertCategory(category, image_link); // Insert category if flag is present
    }

    // Insert links into the database
    const insertResult = await insertLinks(value);
    res.send(insertResult);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/refreshAllData", async (req, res) => {
  try {
    const categories = await new Promise((resolve, reject) => {
      connection.query("SELECT name FROM category", (err, result) => {
        if (err) reject(err);
        else resolve(result.map((row) => row.name));
      });
    });

    let value = [];

    // Step 1: Fetch all data from all categories
    for (let cat of categories) {
      const link = `${api}&q=${cat}&page=1`;
      const { data } = await axios.get(link);

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

    // Step 2: Remove duplicate by ID
    const seen = new Set();
    const finalValues = value
      .filter((obj) => {
        if (seen.has(obj.id)) return false;
        seen.add(obj.id);
        return true;
      })
      .map((obj) => obj.data);

    // Step 3: Clear table
    await new Promise((resolve, reject) => {
      connection.query("DELETE FROM links", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Step 4: Insert final unique values
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

    res.send(
      "✅ All categories fetched, duplicates removed, data inserted successfully!"
    );
  } catch (err) {
    console.error("💥 Error:", err);
    res.status(500).send("😓 Error occurred while refreshing data!");
  }
});

// Function to get IDs from the database
async function getIds() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT id FROM links", (err, result) => {
      if (err) {
        reject(err);
      } else {
        const ids = result.map((item) => item.id);
        resolve(ids); // Return array of ids
      }
    });
  });
}

// Function to insert category into the database
async function insertCategory(category, image_link) {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO category (name, image) VALUES ('${category}', '${image_link}')`,
      (err, result) => {
        if (err) {
          reject("Failed adding category");
        } else {
          resolve("Category added successfully");
        }
      }
    );
  });
}

// Function to insert links into the database
async function insertLinks(value) {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO links (id, tags, previewLink, previewHeight, previewWidth, largeImage, largeHeight, largeWidth, ref, userImage) VALUES ?",
      [value],
      (err, result) => {
        if (err) {
          reject("Failed inserting data into links");
        } else {
          resolve("Data inserted successfully");
        }
      }
    );
  });
}

export default router;

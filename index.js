const mysql = require("mysql");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const multer = require("multer");
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.USER_NAME,
  password: process.env.USER_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

function run() {
  try {
    app.get("/", (req, res) => {
      res.send("server is running");
    });

    const storage = multer.diskStorage({
      destination: "../upload_images",
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      },
    });

    const upload = multer({ storage: storage });

    app.post("/upload-image", upload.single("image"), (req, res) => {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      } else {
        res.sendStatus(200);
      }
    });

    app.post("/addUsers", (req, res) => {
      const sql = "INSERT INTO users SET ?";
      db.query(sql, req.body, (err, results) => {
        if (err) {
          console.error("Error inserting data:", err);
        } else {
          res.send(results);
          console.log(results);
        }
      });
    });

    app.get("/addUsers", (req, res) => {
      db.query("SELECT * FROM users", (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
      });
    });
  } finally {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
}

run();

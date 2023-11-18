const express = require("express");
const multer = require("multer");
const { ImageAnnotatorClient } = require("@google-cloud/vision");

const app = express();
const port = 3000;

require("dotenv").config();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://itot.netlify.app");
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const vision = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/text", upload.single("image"), async (req, res) => {
  try {
    console.log(req.file);
    const [result] = await vision.textDetection(req.file.buffer);
    const textAnnotations = result.textAnnotations;

    const extractedText = textAnnotations
      ? textAnnotations[0].description
      : "No text found";

    res.json(extractedText);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing image " + error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require("express");
const multer = require("multer");
const { ImageAnnotatorClient } = require("@google-cloud/vision");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

require("dotenv").config();

app.use((req, res, next) => {
  // res.header("Access-Control-Allow-Origin", "https://itot.netlify.app");
  const allowedOrigins = [
    "https://itot.netlify.app",
    "http://localhost:3000",
    "http://localhost:4000",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // res.header("Access-Control-Allow-Origin", "https://itot.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const vision = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.json({ limit: "10mb" }));

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

app.post("/text2", async (req, res) => {
  try {
    const base64Image = req.body.image;

    // Remove the data URI prefix and create a Buffer from the base64 string
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const [result] = await vision.textDetection(imageBuffer);
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

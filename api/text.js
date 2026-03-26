const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

const vision = new ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_VISION_KEY),
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  upload.single('image')(req, res, async (err) => {
    try {
      if (err) return res.status(500).send(err.toString());

      const [result] = await vision.documentTextDetection(req.file.buffer);

      const text = result.fullTextAnnotation?.text || 'No text found';

      res.status(200).json({ text });
    } catch (e) {
      console.error(e);
      res.status(500).send(e.toString());
    }
  });
}

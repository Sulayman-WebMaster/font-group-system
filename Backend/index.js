// index.js
import express from 'express';
import multer from 'multer';
import * as fontkit from 'fontkit'; 
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// Temp directory for uploads
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.ttf'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Invalid font file'));
  },
});

// Extract font metadata
async function getFontMetaData(filePath) {
  try {
    const font = await fontkit.open(filePath);
    return {
      family: font.familyName,
      fullName: font.fullName,
      style: font.subfamilyName,
      weight: font.weight,
    };
  } catch (err) {
    console.error('Font parse error:', err);
    return null;
  }
}

// Upload endpoint
app.post('/upload-fonts', upload.array('fonts', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No fonts uploaded' });
  }

  const result = [];

  for (const file of req.files) {
    const metadata = await getFontMetaData(file.path);
    if (metadata) {
      result.push({
        ...metadata,
        filename: file.originalname,
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(file.path);
  }

  res.json({
    message: 'Fonts processed successfully',
    fonts: result,
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

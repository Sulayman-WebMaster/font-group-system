// index.js
import express from 'express';
import multer from 'multer';
import * as fontkit from 'fontkit';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config()
app.use(cors({
  origin: 'https://bright-zabaione-58ce05.netlify.app',
 }));
app.use(express.json());

// --- MongoDB Setup ---
const MONGO_URI = process.env.MONGO_URI
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err));

// Font Schema
const fontSchema = new mongoose.Schema({
  filename: String,
  family: String,
  fullName: String,
  style: String,
  weight: String,
  base64: String
});
const Font = mongoose.model('Font', fontSchema);

// Font Group Schema
const groupSchema = new mongoose.Schema({
  fonts: [String] // stores font IDs
});
const FontGroup = mongoose.model('FontGroup', groupSchema);

// --- Multer Setup ---
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.ttf'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Invalid font file'));
  }
});

// --- Helpers ---
async function getFontMetaData(filePath) {
  try {
    const font = await fontkit.open(filePath);
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    return {
      family: font.familyName,
      fullName: font.fullName,
      style: font.subfamilyName,
      weight: font.weight,
      base64
    };
  } catch (err) {
    console.error('Font parse error:', err);
    return null;
  }
}

// --- Routes ---

// Upload Fonts
app.post('/upload-fonts', upload.array('fonts', 10), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ message: 'No fonts uploaded' });
  }

  const savedFonts = [];

  for (const file of req.files) {
    const meta = await getFontMetaData(file.path);
    if (meta) {
      const fontDoc = new Font({
        filename: file.originalname,
        ...meta
      });
      const saved = await fontDoc.save();
      savedFonts.push(saved);
    }
    fs.unlinkSync(file.path);
  }

  res.json({
    message: 'Fonts uploaded and saved',
    fonts: savedFonts
  });
});

// Get Fonts
app.get('/fonts', async (req, res) => {
  const fonts = await Font.find().lean();
  res.json(fonts);
});

// Create Font Group
app.post('/font-groups', async (req, res) => {
  const { fonts } = req.body;
  if (!fonts || fonts.length < 2) {
    return res.status(400).json({ message: 'At least two fonts required.' });
  }

  const group = new FontGroup({ fonts });
  await group.save();
  res.status(201).json({ message: 'Font group created', group });
});

// Get All Font Groups
app.get('/font-groups', async (req, res) => {
  const groups = await FontGroup.find().lean();
  res.json(groups);
});

// Delete Font Group
app.delete('/font-groups/:id', async (req, res) => {
  const { id } = req.params;
  const deleted = await FontGroup.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Group not found' });
  res.json({ message: 'Group deleted' });
});

// Edit Font Group
app.put('/font-groups/:id', async (req, res) => {
  const { id } = req.params;
  const { fonts } = req.body;
  if (!fonts || fonts.length < 2) {
    return res.status(400).json({ message: 'At least two fonts required.' });
  }

  const updated = await FontGroup.findByIdAndUpdate(id, { fonts }, { new: true });
  if (!updated) return res.status(404).json({ message: 'Group not found' });
  res.json({ message: 'Group updated', group: updated });
});
app.put('/update-font-groups', async (req, res) => {
  const { id, fonts } = req.body;

  if (!id || !fonts || fonts.length < 2) {
    return res.status(400).json({ message: 'Missing ID or fonts' });
  }

  const updated = await FontGroup.findByIdAndUpdate(id, { fonts }, { new: true });

  if (!updated) {
    return res.status(404).json({ message: 'Group not found' });
  }

  res.json({ message: 'Group updated', updated });
});
// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

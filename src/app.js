const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const jwt     = require('jsonwebtoken');

const app = express();

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const PORT = process.env.DOCKER_PORT;

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = payload;  // optional: attach payload to request
    next();
  });
}

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = `${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  }
});

// Multer setup: limit size + filter for .html/.htm only
const upload = multer({
  storage,
  limits: { fileSize: +process.env.MAX_FILE_SIZE},
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.html', '.htm', '.png'];
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only HTML files (.html, .htm, .png) are allowed'));
    }
  }
});

// Health check
app.get('/', (req, res) => res.send('running'));

// Single file upload (field name = "file")
app.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      message: 'Upload successful',
      filename: req.file.filename,
      size: req.file.size,
      uploadedBy: req.user  // payload from token
    });
  }
);

// Multiple files upload (field name = "files")
app.post(
  '/upload-multiple',
  authenticateToken,
  upload.array('files', 50),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    res.json({
      message: 'Upload successful',
      files: req.files.map(f => ({ filename: f.filename, size: f.size })),
      uploadedBy: req.user
    });
  }
);

// Global error handler for multer and other errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`HTML-upload API listening on http://localhost:${PORT}`);

  const payload = {
    userId: 'martin',               // anything you want your server to know
    role: 'uploader'
  };
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET         // this must match the server’s secret
  );
  
  console.log('Generated JWT API Token:', token);
});



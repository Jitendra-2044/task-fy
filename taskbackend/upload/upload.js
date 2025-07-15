// utils/upload.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();

const upload = multer({ storage });

const processImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const filename = `user-${Date.now()}.jpg`;
    const filepath = path.join(__dirname, '..', 'public', 'uploads', filename);

    await sharp(req.file.buffer)
      .resize(200, 200)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(filepath);

    req.body.profileImage = `/uploads/${filename}`;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, processImage };

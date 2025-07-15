const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const processImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const filename = `user-${Date.now()}.jpeg`;
    const filepath = path.join(__dirname, '..', 'public', 'uploads', filename);

    await sharp(req.file.buffer)
      .resize(200, 200)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(filepath);

    req.body.profileImage = `/uploads/${filename}`;
    next();
  } catch (err) {
    console.error("Image processing failed:", err);
    res.status(500).json({ message: "Failed to process image", error: err.message });
  }
};

module.exports = { upload, processImage };

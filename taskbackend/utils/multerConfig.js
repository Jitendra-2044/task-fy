const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.body.user;
    const taskId = new Date().getTime();
    const dir = `uploads/${userId}/${taskId}`;

    fs.mkdirSync(dir, { recursive: true });
    req.customUploadPath = dir;
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

exports.uploadTaskFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10
  fileFilter: function (req, file, cb) {
    const allowed = /pdf|docx|doc|jpg|jpeg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.test(ext)) return cb(new Error("Invalid file type"));
    cb(null, true);
  }
});

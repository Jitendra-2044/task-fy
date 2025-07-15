const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const User = require("../model/userModel");
const multer = require('multer');


exports.allUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      status: "success",
      data: { users }
    });
  } catch (err) {
    console.error("allUsers Error:", err);
    res.status(500).json({
      status: 'fail',
      message: 'Could not fetch users',
    });
  }
};

// Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', req.params.userId);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, 'profile' + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

exports.updateProfile = async (req, res) => {
  try {
    
    const imagePath = `/uploads/${req.params.userId}/${r}`;
    console.log(req, 'req.file.filenamereq.file.filename', imagePath);
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { profileImage: imagePath },
      { new: true }
    );
    res.json({ status: 'success', data: { profileImage: user.profileImage } });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Image upload failed' });
  }
};

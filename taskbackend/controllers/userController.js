const User = require('../model/userModel');
const redisClient = require('../helpers/redisClient'); 

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({ status: 'success', data: users });
};

exports.getMyProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const cachedData = await redisClient.get(`profile:${userId}`);
    if (cachedData) {
      return res.status(200).json({
        status: 'success',
        source: 'cache',
        data: JSON.parse(cachedData)
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    await redisClient.setEx(`profile:${userId}`, 60 * 60, JSON.stringify(user));

    res.status(200).json({
      status: 'success',
      source: 'db',
      data: user
    });
  } catch (err) {
    console.error('Redis/profile error:', err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};


exports.updateProfile = async (req, res) => {
  const updates = { name: req.body.name, email: req.body.email };

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true
  });

  await redisClient.del(`profile:${req.user.id}`);

  res.status(200).json({ status: 'success', data: user });
};


exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: 'success', message: 'User deleted' });
};
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

exports.uploadProfileImage = async (req, res) => {
  const userId = req.params.id;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  const outputPath = `uploads/${userId}-profile.jpg`;

  try {
    await sharp(file.path)
      .resize(200, 200)
      .toFile(outputPath);

    fs.unlinkSync(file.path);

    const imageUrl = `/${outputPath}`; 
    
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    );

    res.json({
      message: "Profile image uploaded",
      data: { profileImage: imageUrl },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Image processing failed" });
  }
};

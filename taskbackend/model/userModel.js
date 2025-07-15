  const bcrypt = require('bcrypt');
  const mongoose = require('mongoose');
  const validator = require('validator');

  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please tell us a name'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
    },
    profileImage: {
      type: String,
      default: "/public/uploads/default.jpg"
    }
});

  userSchema.methods.correctPassword = function (candidatePassword, userPassword) {
    console.log(candidatePassword, userPassword, "password Check");
    return bcrypt.compare(candidatePassword, userPassword)
  };

  const User = mongoose.model('User', userSchema);

  module.exports = User;

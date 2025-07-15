const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const bcrypt = require('bcrypt');
const redisClient = require("../helpers/redisClient");

// generate token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

exports.check = async (req, res) => {
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  res.status(200).json({
    status: 200,
    message: "This is a check: Jitendra Singh"
  });
};

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Create a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: 'Something went wrong during signup' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt with email:", email);

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide both Email & Password" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.warn("User not found for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("Incorrect password for user:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    await redisClient.setEx(`session:${user._id}`, 60 * 60 * 24, token);


    return res.status(200).json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Login failed due to server error" });
  }
};



exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "You are not logged in!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id).select("-password");
    if (!currentUser) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    const redisToken = await redisClient.get(`session:${decoded.id}`);

    if (redisToken !== token) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    req.user = currentUser;

    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid token or token expired." });
  }
};

exports.logout = async (req, res) => {
  const userId = req.user.id;
  await redisClient.del(`session:${userId}`);
  res.json({ message: "Logged out" });
};

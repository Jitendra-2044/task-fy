const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../controllers/authController');
const upload = require("../middleware/uploadMiddleware");
const { uploadProfileImage } = require("../controllers/userController");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile & management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', auth.protect, userController.getAllUsers);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.post('/me', auth.protect, userController.getMyProfile);

/**
 * @swagger
 * /users/id:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user
 */
router.put('/id', auth.protect, userController.updateProfile);


/**
 * @swagger
 * /users/upload-profile/{id}:
 *   post:
 *     summary: Upload profile image
 *     tags: [Users]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded
 */
router.post("/upload-profile/:id", upload.single("image"), uploadProfileImage);


module.exports = router;

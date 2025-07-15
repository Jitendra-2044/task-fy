const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../controllers/authController');
const { uploadTaskFile } = require('../utils/multerConfig');

router.use(authMiddleware.protect);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /tasks/allTasks:
 *   post:
 *     summary: Get all tasks for a user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.post('/allTasks', taskController.getAllTasks);

/**
 * @swagger
 * /tasks/create:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Task created
 */
router.post('/create', uploadTaskFile.single('file'), taskController.createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Task updated
 */
router.put('/:id', uploadTaskFile.single('file'), taskController.updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task deleted
 */
router.delete('/:id', taskController.deleteTask);

module.exports = router;

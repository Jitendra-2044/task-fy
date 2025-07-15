const fs = require("fs");
const path = require("path");
const Task = require('../model/taskModel');
const { sendTaskMail } = require("../utils/mail");
const User = require("../model/userModel");

exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.body.userId;

    const tasks = await Task.find().select('-__v');
    // console.log(tasks, 'tasks tasks');    
    
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: tasks
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({
      status: 'fail',
      message: 'Could not fetch tasks'
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ status: "success", data: tasks });
  } catch (err) {
    console.error("Get Tasks Error:", err);
    res.status(500).json({ message: "Could not fetch tasks" });
  }
};

// CREATE  task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    const files = req.files?.map(file => `/uploads/${req.user.id}/${file.filename}`) || [];
    console.log(files, 'JJJJJJJJJJJJJJJJJ', req.body);
    
    const task = await Task.create({
      user: req?.body.user,
      title,
      description,
      dueDate,
      status,
      attachments: files,
    });

    const io = req.app.get("io");
    io.emit("taskCreated", task);

    const user = await User.findById(req.body.user);
    if (user?.email) {
      await sendTaskMail({
        to: user.email,
        subject: `✅ Task Created: ${title}`,
        text: `Hi ${user.name || 'User'},\n\nYour task "${title}" has been created successfully.\n\nDescription: ${description}\nDue Date: ${dueDate || 'Not set'}\n\nThanks!`,
      });
    }
    res.status(201).json({ status: "success", data: task });
  } catch (err) {
    console.error("Create Task Error:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    const updates = { title, description, dueDate, status };

    if (req.file) {
      updates.attachments = [`/uploads/${req.body.user}/${req.file.filename}`];
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });

    const io = req.app.get("io");
    io.emit("taskStatusUpdated", updatedTask);

    if (status === "3") {
      const user = await User.findById(updatedTask.user);
      if (user?.email) {
        await sendTaskMail({
          to: user.email,
          subject: `🎉 Task Completed: ${updatedTask.title}`,
          text: `Hi ${user.name || 'User'},\n\nGreat job! Your task "${updatedTask.title}" is marked as completed.\n\nKeep it up!`,
        });
      }
    }

    return res.json({ status: "success", data: updatedTask });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ message: "Failed to update task" });
  }
};


// DELETE  task 
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const io = req.app.get("io");
    io.emit("taskDeleted", task._id); 

    if (task.attachments && task.attachments.length > 0) {
      for (let file of task.attachments) {
        try {
          const filePath = path.join(__dirname, "..", file);
          await fs.unlink(filePath);
        } catch (err) {
          console.warn("File delete failed:", file, err.message);
        }
      }
    }

    await task.deleteOne();
    
    res.json({ status: "success", message: "Task deleted" });
  } catch (err) {
    console.error("Delete Task Error:", err.message);
    res.status(500).json({ message: "Failed to delete task" });
  }
};


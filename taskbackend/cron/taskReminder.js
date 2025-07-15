const cron = require('node-cron');
const Task = require('../model/taskModel');
const User = require('../model/userModel');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReminderEmail = async (to, task) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Task Reminder: ${task.title}`,
    text: `This is a reminder that your task "${task.title}" is due today (${task.dueDate}).\n\nDescription: ${task.description}\n\nPlease take necessary action.`,
  };

  await transporter.sendMail(mailOptions);
};

const checkDueTasks = async () => {
  try {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const dueTasks = await Task.find({ dueDate: { $gte: start, $lte: end } }).populate("user");

    for (const task of dueTasks) {
      if (task.user?.email) {
        await sendReminderEmail(task.user.email, task);
        console.log(`Email sent to ${task.user.email} for task "${task.title}"`);
      }
    }
  } catch (err) {
    console.error("Cron job failed:", err.message);
  }
};

// rvery day at 8:00 AM
cron.schedule('0 8 * * *', () => {
  console.log("Running cron job at 8:00 AM...");
  checkDueTasks();
});

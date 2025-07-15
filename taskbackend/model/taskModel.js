const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },  
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  status: { type: String, enum: ['1', '2', '3'], default: '1' },
  attachments: [String],
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);

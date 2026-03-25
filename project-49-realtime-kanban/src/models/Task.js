const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["To Do", "In Progress", "Done"],
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;

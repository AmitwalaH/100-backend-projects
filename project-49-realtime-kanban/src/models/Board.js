const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  columns: {
    type: String,
    required: true,
    enum: ["To Do", "In Progress", "Done"],
  },
});

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;
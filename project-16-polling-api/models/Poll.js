const mongoose = require("mongoose");
const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [
    {
      option: {
        type: String,
        required: true,
        trim: true,
      },
      votes: {
        type: Number,
        default: 0,
      },
    },
  ],
});

module.exports = mongoose.model("Poll", PollSchema);

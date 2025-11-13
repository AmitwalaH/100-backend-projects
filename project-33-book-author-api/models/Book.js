const mongoose = require("mongoose");

const BookSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  genre: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
});

module.exports = mongoose.model("Book", BookSchema);

const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // This means it's a top-level comment if null
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", CommentSchema);

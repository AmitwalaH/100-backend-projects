const mongoose = require("mongoose");

// Create a Post schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  }
});

// Create a Post model
const Post = mongoose.model("Post", postSchema);
module.exports = Post;

const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// POST /api/posts

router.post("/", (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = new Post({ title, content });
    newPost.save();
    res.status(201).send("Post created successfully!");
  } catch (error) {
    res.status(500).send("Error creating post: " + error.message);
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).send("Error fetching posts: " + error.message);
  }
});

module.exports = router;

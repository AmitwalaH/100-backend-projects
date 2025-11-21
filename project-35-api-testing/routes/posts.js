const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// POST /api/posts

router.post("/", async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    const savedPost = await Post.create(req.body);
    res.status(201).json(savedPost);
  } catch (error) {
    // ...
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

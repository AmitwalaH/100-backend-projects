const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// Create a new post
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    // Create new post
    const newPost = new Post({ title, content });
    await newPost.save();

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

// Get a single post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).send("Error fetching post: " + error.message);
  }
});

// Update a post by ID
router.put("/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );

    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.status(200).send("Post updated successfully!");
  } catch (error) {
    res.status(500).send("Error updating post: " + error.message);
  }
});

// Delete a post by ID
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.status(200).send("Post deleted successfully!");
  } catch (error) {
    res.status(500).send("Error deleting post: " + error.message);
  }
});

module.exports = router;

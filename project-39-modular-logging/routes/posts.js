const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// GET /api/posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// POST /api/posts
router.post("/", async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, error: "Invalid data provided" });
  }
});

// GET /api/posts/error
router.get("/error", (req, res, next) => {
  // This will generate a 500 Internal Server Error log
  throw new Error("Intentional Test Error for Logging");
});

module.exports = router;

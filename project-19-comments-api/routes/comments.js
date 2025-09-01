const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const { protect } = require("../middleware/auth");
const mongoose = require("mongoose");

// POST /api/comments
router.post("/", protect, async (req, res) => {
  try {
    const { text, parentId } = req.body;
    const comment = new Comment({
      text,
      author: req.user.id,
      parent: parentId || null,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/comments
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find({ parent: null }) // Find only top-level comments
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/comments/:id/replies
router.get("/:id/replies", async (req, res) => {
  try {
    const { id } = req.params;
    const replies = await Comment.find({ parent: id }) // Find comments with the specified parentId
      .populate("author", "username")
      .sort({ createdAt: 1 });
    res.json(replies);
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/comments/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden. You do not own this comment." });
    }
    comment.text = text;
    await comment.save();
    res.json(comment);

  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/comments/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden. You do not own this comment." });
    }

    await Comment.findByIdAndDelete(id);
    res.json({ message: "Comment deleted successfully." });
    
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

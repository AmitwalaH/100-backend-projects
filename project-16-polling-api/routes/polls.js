const express = require("express");
const mongoose = require("mongoose");
const Poll = require("../models/Poll");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");

// POST /api/polls
router.post(
  "/",
  protect,
  body("question").notEmpty().withMessage("Question is required"),
  body("options")
    .isArray({ min: 2 })
    .withMessage("At least two options are required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question, options } = req.body;

    try {
      const poll = new Poll({
        question,
        // Map array of strings to objects with a 'text' field
        options: options.map((option) => ({ option: option })),
      });

      await poll.save();
      res.status(201).json(poll);
    } catch (err) {
      console.error("Error creating poll:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /api/polls
router.get("/", async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (err) {
    console.error("Error fetching polls:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/polls/:id
router.get("/:id", async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    res.json(poll);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid poll ID" });
    }
    console.error("Error fetching poll:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/polls/:id/vote
router.post(
  "/:id/vote",
  protect,
  body("option").notEmpty().withMessage("Option is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { option } = req.body;

    try {
      const poll = await Poll.findById(req.params.id);
      if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      const optionIndex = poll.options.findIndex(
        (opt) => opt.option === option
      );
      if (optionIndex === -1) {
        return res.status(400).json({ error: "Invalid option" });
      }

      poll.options[optionIndex].votes += 1;

      await poll.save();
      res.json(poll);
    } catch (err) {
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ error: "Invalid poll ID" });
      }
      console.error("Error voting on poll:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;

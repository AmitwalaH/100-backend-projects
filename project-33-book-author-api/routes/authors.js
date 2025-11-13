const express = require("express");
const router = express.Router();
const Author = require("../models/Author");

// POST /api/post
router.post("/", async (req, res) => {
  try {
    const author = req.body;
    author = new Author();
    await author.save();
    res.status(201).json(author);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//GET /api/get
router.get("/", async (req, res) => {
  try {
    const author = await Author.find();
    res.json(author);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

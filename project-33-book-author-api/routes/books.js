const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// POST /api/books
router.post("/", async (req, res) => {
  try {
    const { title, genre, author } = req.body;
    const newBook = new Book({ title, genre, author });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find()
      // The .populate() method fetches the full Author document
      .populate("author", "name bio");

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books." });
  }
});

//GET /api/books/:id
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "author",
      "name bio"
    );

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book." });
  }
});

module.exports = router;

const Note = require("../models/Note");

// 1. Create a New Note
exports.createNote = async (req, res) => {
  try {
    const { title, description, markdown } = req.body;
    const note = new Note({ title, description, markdown });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 2. Get All Notes
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Get Single Note by Slug 
exports.getNoteBySlug = async (req, res) => {
  try {
    const note = await Note.findOne({ slug: req.params.slug });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

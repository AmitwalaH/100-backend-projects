const express = require("express");
const router = express.Router();
const Board = require("../models/Board");
const Task = require("../models/Task");

// fetch all boards
router.get("/", async (req, res) => {
  try {
    const boards = await Board.find();
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// fetch a single board with its tasks

router.get("/:id", async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const tasks = await Task.find({ board: board._id });

    res.json({ board, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

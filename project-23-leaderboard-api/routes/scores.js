const express = require("express");
const router = express.Router();
const Score = require("../models/Score");
const { protect } = require("../middleware/auth");

// It needs to be a function that accepts 'io' as an argument
module.exports = (io) => {
  // POST /api/scores
  router.post("/", protect, async (req, res) => {
    try {
      const { score } = req.body;

      // Create a new score
      const newScore = new Score({
        userId: req.user.id,
        score: score,
      });
      await newScore.save();

      const updatedLeaderboard = await Score.find()
        .sort({ score: -1 })
        .limit(10)
        .populate("userId", "username");

      // Show the updated leaderboard to all clients
      io.emit("leaderboardUpdate", updatedLeaderboard);

      res.status(201).json(newScore);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  });

  // GET /api/scores
  router.get("/", async (req, res) => {
    try {
      const scores = await Score.find()
        .sort({ score: -1 })
        .limit(10)
        .populate("userId", "username");
      res.status(200).json(scores);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  });

  // GET /api/scores/my-scores
  router.get("/my-scores", protect, async (req, res) => {
    try {
      const myScores = await Score.find({ userId: req.user.id })
        .sort({ score: -1 })
        .populate("userId", "username");
      res.status(200).json(myScores);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  });

  return router;
};

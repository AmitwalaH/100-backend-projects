const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const mongoose = require("mongoose");

module.exports = (redisClient) => {
  const leaderBoardKey = "global_leaderboard";

  // POST /api/scores (Submit Score)
  router.post("/", protect, async (req, res) => {
    try {
      const userId = req.user.id;
      const { score } = req.body;

      if (typeof score !== "number" || score < 0) {
        return res
          .status(400)
          .json({ message: "Score must be a non-negative number" });
      }
      await redisClient.zAdd(leaderBoardKey, {
        score: score,
        value: userId.toString(),
      });

      return res.status(200).json({ message: "Score submitted successfully" });
    } catch (error) {
      console.error("Error submitting score:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });

  // GET /api/scores (Top 10 Leaderboard)
  router.get("/", async (req, res) => {
    try {
      const topScores = await redisClient.zRangeWithScores(
        leaderBoardKey,
        0,
        9,
        { REV: true }
      );

      if (topScores.length === 0) {
        return res.status(200).json({ leaderboard: [] });
      }

      const scoresWithUserPromises = topScores.map(async (item, index) => {
        const user = await User.findById(item.value).select("username -_id");

        return {
          rank: index + 1,
          username: user ? user.username : "Unknown User",
          score: parseInt(item.score),
        };
      });

      const scores = await Promise.all(scoresWithUserPromises);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Server error fetching leaderboard." });
    }
  });

  // GET /api/scores/rank/:userId (User Rank)
  router.get("/rank/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      // 1. ZREVRANK: Get the 0-indexed rank
      const rank = await redisClient.zRevRank(leaderBoardKey, userId);

      // 2. ZSCORE: Get the user's current score
      const score = await redisClient.zScore(leaderBoardKey, userId);

      if (rank === null) {
        return res
          .status(404)
          .json({ error: `User ID ${userId} not found in leaderboard.` });
      }

      // Fetching username from MongoDB
      const user = await User.findById(userId).select("username -_id");

      res.json({
        userId: userId,
        username: user ? user.username : "Unknown User",
        rank: parseInt(rank) + 1, // Converting 0-indexed rank to 1-indexed
        score: parseInt(score),
      });
    } catch (error) {
      res.status(500).json({ error: "Server error fetching user rank." });
    }
  });

  return router;
};

// server.js
const express = require("express");
const dotenv = require("dotenv");
const Redis = require("ioredis");

dotenv.config();

const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

// Confirmation logging
redisClient.on("connect", () => {
  console.log("Redis connected successfully!");
});

const app = express();
app.use(express.json());

// POST /api/profile/:userId
app.post("/api/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, age, bio } = req.body;

    const redisKey = `user:${userId}`;

    // Prepare data for HMSET: [field1, value1, field2, value2, ...]
    const profileData = ["name", name, "email", email, "age", age, "bio", bio];

    // HMSET (Hash Multiple Set)
    await redisClient.hmset(redisKey, ...profileData);

    res.json({
      message: `Profile for user ${userId} created/updated.`,
      key: redisKey,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save profile data." });
  }
});

// GET /api/profile/:userId
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const redisKey = `user:${userId}`;

    // HGETALL (Hash Get All)
    const profile = await redisClient.hgetall(redisKey);

    if (Object.keys(profile).length === 0) {
      return res
        .status(404)
        .json({ error: `User profile ${userId} not found.` });
    }
    profile.age = parseInt(profile.age);

    res.json({ userId, profile });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve profile data." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

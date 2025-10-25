const express = require("express");
const dotenv = require("dotenv");
const Redis = require("ioredis");

dotenv.config();

const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// Redis Client Initialization
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

// POST /api/data
app.post("/api/data", async (req, res) => {
  try {
    const { key, value, ttl } = req.body;

    if (!key || !value) {
      return res.status(400).json({ error: "Key and value are required." });
    }

    if (ttl > 0) {
      await redisClient.set(key, value, "EX", ttl);
      res.json({ message: `Key "${key}" set with TTL of ${ttl} seconds.` });
    } else {
      await redisClient.set(key, value);
      res.json({ message: `Key "${key}" set permanently.` });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to set data in Redis." });
  }
});

// GET /api/data/:key
app.get("/api/data/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const value = await redisClient.get(key);

    if (value === null) {
      return res
        .status(404)
        .json({ error: `Key "${key}" not found in Redis.` });
    }

    res.json({ key, value });
  } catch (error) {
    res.status(500).json({ error: "Failed to get data from Redis." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

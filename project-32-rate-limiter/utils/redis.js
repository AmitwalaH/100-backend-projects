const Redis = require("ioredis");
const { log } = require("winston");
require("dotenv").config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || "6379",
});

redisClient.on("connect", () => {
  console.log("Redis Connected Successfully");
});

redisClient.on("error", (err) => {
  console.error(" Redis connection error:", err);
});


module.exports = redisClient;
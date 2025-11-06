const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
// const Redis = require('ioredis');

const rateLimiterFactory = require("./middleware/rateLimiter");
const postsRouter = require("./routes/posts");
const redisClient = require("./utils/redis");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const apiLimiter = rateLimiterFactory(redisClient);

app.use("/api", apiLimiter(10, 60000));
app.use(express.json());
app.use(cors());

app.use("/api/posts", postsRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Advanced Security and Rate Limiting API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

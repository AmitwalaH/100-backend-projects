const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { logger, morganMiddleware } = require("./middleware/logger");
const postsRouter = require("./routes/posts");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    logger.error("MongoDB connection error. Server exiting.", {
      stack: err.stack,
    });
    process.exit(1);
  });
app.use(express.json());

// 2. IMPORTANT: using the Morgan/Winston middleware FIRST to log all incoming requests
app.use(morganMiddleware);

app.use("/api/posts", postsRouter);

app.get("/", (req, res) => {
  res.send("Modular Logging API Running");
});

// This handles errors thrown by route handlers (like the /api/posts/error route)
app.use((err, req, res, next) => {
  logger.error(
    `Unhandled Error on ${req.method} ${req.originalUrl}: ${err.message}`,
    {
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
    }
  );
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

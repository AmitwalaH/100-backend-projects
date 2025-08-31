const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { morganMiddleware } = require("./middleware/logger");
const apiLimiter = require("./middleware/rateLimiter");
const postsRouter = require("./routes/posts");

const app = express();
dotenv.config();

app.use(morganMiddleware);
app.use("/api", apiLimiter);

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/api/posts", postsRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Advanced Security and Logging API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

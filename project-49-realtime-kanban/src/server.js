const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const boardRoutes = require("./routes/boardRoutes");

const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

require("./socket/boardHandler")(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/boards", boardRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Kanban API");
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb://localhost:27017/kanban";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    http.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
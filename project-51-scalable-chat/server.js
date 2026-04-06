require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const setupRedisAdapter = require("./config/redis");
const chatHandler = require("./socket/chatHandler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const startServer = async () => {
  try {
    await setupRedisAdapter(io);
    chatHandler(io);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();

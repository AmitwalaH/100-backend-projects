const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const nexusManager = require("./nexusManager");

const app = express();
const server = http.createServer(app);
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",   
  },
  pingInterval: 25000,
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  nexusManager.handleConnection(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${reason}`);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { initializeNexus } = require("./managers/nexusManager");

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

initializeNexus(io);

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

const app = express();
const server = createServer(app);
// Attach socket.io to the server
const io = new Server(server);

dotenv.config();

const PORT = process.env.PORT || 3000;

// Serve a static HTML file for the client
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// --- Real-time Chat Logic ---
// Listen for client connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for incoming messages from the client
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    // Broadcast the message to all connected clients
    io.emit('chat message', msg);
  });

  // Listen for disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

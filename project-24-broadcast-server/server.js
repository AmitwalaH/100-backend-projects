const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// A simple object to track which room each user is in
const userSockets = {};


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handling user joining a specific room
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    userSockets[socket.id] = roomName;
    console.log(`User ${socket.id} joined room: ${roomName}`);
  });

  // Handling incoming messages
  socket.on('message', (msg) => {
    // Find the room the user is in
    const roomName = userSockets[socket.id];
    if (roomName) {
      // Broadcast the message only to users in the same room
      io.to(roomName).emit('message', msg);
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    const roomName = userSockets[socket.id];
    console.log('A user disconnected:', socket.id);
    // Clean up the user from our tracking object
    if (roomName) {
        delete userSockets[socket.id];
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



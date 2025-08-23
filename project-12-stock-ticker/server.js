const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


const generateStockPrice = () => {
  const min = 100;
  const max = 200;
  // Generate a random number between 100 and 200 with 2 decimal places
  const price = (Math.random() * (max - min) + min).toFixed(2);
  const timestamp = new Date().toLocaleTimeString();
  return { price, timestamp };
};

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


setInterval(() => {
  const stockData = generateStockPrice();
  io.emit('stockUpdate', stockData);
}, 3000); // 3 seconds interval


server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});



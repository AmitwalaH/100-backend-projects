const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.USERS_PORT || 3001;

const users = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Bob Johnson' },
];

// Define the route for this service
app.get('/users', (req, res) => {
  console.log('Users service received a request');
  res.json(users);
});

// Start the server for the microservice
app.listen(PORT, () => {
  console.log(`Users service running on port ${PORT}`);
});
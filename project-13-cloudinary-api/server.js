const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const uploadRoutes = require('./routes/upload');

const app = express();
dotenv.config();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


app.use('/api', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Cloudinary File Storage API!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

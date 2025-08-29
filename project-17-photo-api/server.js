const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRouter = require('./routes/auth');
const photosRouter = require('./routes/photos');

const app = express();
dotenv.config();


app.use(express.json()); 
app.use(cors()); 
app.use('/uploads', express.static('uploads'));

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

app.use('/api/auth', authRouter);
app.use('/api/photos', photosRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Simple Photo Sharing API!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
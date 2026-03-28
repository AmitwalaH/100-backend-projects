const express = require('express');
const noteRoutes = require('./routes/noteRoutes');
const mongoose = require('mongoose');
const http = require('http').createServer();
const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb://localhost:27017/notesdb";

const app = express();

// Middleware for JSON
app.use(express.json());

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

// Main Route
app.use('/api/notes', noteRoutes);

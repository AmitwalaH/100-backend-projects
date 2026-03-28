const express = require('express');
const noteRoutes = require('./routes/noteRoutes');

const app = express();

// Middleware for JSON
app.use(express.json());

// Main Route
app.use('/api/notes', noteRoutes);

module.exports = app;
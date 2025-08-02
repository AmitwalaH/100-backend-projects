const express = require("express");
const mongoose = require("mongoose");
const fileRoutes = require("./routes/files");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/fileupload")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB error:", err));

// Middleware
app.use(express.json());

// Routes
app.use('/api/files', fileRoutes);

app.get('/', (req, res) => {
  res.send('File Upload API');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Url = require("./models/Url");
const shortenRoutes = require("./routes/shorten");
const app = express();
dotenv.config();


app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process on connection failure
  });

// --- Route Mounting ---
app.use("/api", shortenRoutes);

// --- Root Route for Redirects ---
app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "Short code not found." });
    }

    // Increment click count and save
    url.clicks += 1;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error retrieving URL:", error);
    res.status(500).json({ error: "Error retrieving URL." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

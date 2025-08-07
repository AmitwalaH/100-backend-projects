const express = require("express");
const { nanoid } = require("nanoid");
const router = express.Router();
const Url = require("../models/Url");

// POST route to create a new shortened URL
router.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  // Validate input
  if (!originalUrl) {
    return res.status(400).json({ error: "Original URL is required." });
  }

  const shortCode = nanoid(8); // Generates an 8-character unique ID

  try {
    // Create a new URL document
    const url = new Url({ originalUrl, shortCode });
    await url.save();
    res.status(201).json(url);
  } catch (error) {
    console.error("Error creating shortened URL:", error);
    res.status(500).json({ error: "Error creating shortened URL." });
  }
});

// GET route to redirect to the original URL
router.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    // Find the URL by short code
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "Short code not found." });
    }

    // Increment click count
    url.clicks += 1;
    await url.save();

    // Redirect to the original URL
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error retrieving URL:", error);
    res.status(500).json({ error: "Error retrieving URL." });
  }
});

// Export the router
module.exports = router;

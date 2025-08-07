const express = require("express");
let nanoid;
import("nanoid").then((module) => {
  nanoid = module.nanoid;
});

const router = express.Router();
const Url = require("../models/Url");

// POST route to create a new shortened URL
router.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "Original URL is required." });
  }

  // Check if nanoid is ready
  if (!nanoid) {
    return res.status(500).json({ error: "Service is not ready yet." });
  }
  const shortCode = nanoid(8);

  try {
    const url = new Url({ originalUrl, shortCode });
    await url.save();
    res.status(201).json(url);
  } catch (error) {
    console.error("Error creating shortened URL:", error);
    res.status(500).json({ error: "Error creating shortened URL." });
  }
});
//Export the router
module.exports = router;

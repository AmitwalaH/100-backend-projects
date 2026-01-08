const express = require("express");
const router = express.Router();

const { generateMeme } = require("../services/memeService");

router.get("/generate", async (req, res) => {
  try {
    const { text, template } = req.query;

    res.set("Content-Type", "image/jpeg");

    res.status(200).send(await generateMeme(text, template));
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

const express = require("express");
const { getGeminiResponse } = require("../services/aiService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Please enter a prompt" });
    }

    const response = await getGeminiResponse(prompt);
    res.status(200).json({ aiResponse: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const sentiment = require("sentiment");

router.post("/sentiment", (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ error: "Text field is required for analysis." });
    }

    const result = sentiment(text);

    // Determine the general tone based on the score
    let tone = "Neutral";   
    if (result.score > 0) {
      tone = "Positive";
    } else if (result.score < 0) {
      tone = "Negative";
    }

    // Send back the analysis report
    res.json({
      text: text,
      score: result.score,
      tone: tone,
      analysis: result,
    });
  } catch (error) {
    console.error("Sentiment analysis failed:", error);
    res.status(500).json({ error: "Server error during analysis." });
  }
});

module.exports = router;

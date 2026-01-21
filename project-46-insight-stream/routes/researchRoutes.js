const express = require("express");
const router = express.Router();
const { researchQuery } = require("../services/aiService");

router.post("/research", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Please enter a query" });
    }
    const result = await researchQuery(query);

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;

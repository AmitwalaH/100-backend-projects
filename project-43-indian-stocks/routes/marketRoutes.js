const express = require("express");
const router = express.Router();
const { getStockData } = require("../services/marketService");

// GET /api/stocks/:name
router.get("/:name", async (req, res) => {
  try {
    const data = await getStockData(req.params.name);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

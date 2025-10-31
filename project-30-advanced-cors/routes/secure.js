const express = require("express");
const router = express.Router();

// Handling OPTIONS Preflight Requests
router.use((req, res, next) => {
  // 1. Telling the browser which origins are allowed to connect
  res.header("Access-Control-Allow-Origin", "*");

  // 2. Telling the browser which methods (GET, POST, etc.) are allowed
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  // 3. Telling the browser which headers are allowed
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 4. If the request is the OPTIONS preflight, end the response now.
  if (req.method === "OPTIONS") {
    return res.status(204).send(); // 204 No Content for preflight
  }

  next(); // Move to the actual GET or POST route
});

// Simple GET Route (Triggers basic CORS check)
router.get("/simple", (req, res) => {
  res.json({ message: "GET request successful and simple." });
});

router.post("/protected", (req, res) => {
  res.json({ message: "POST request successful and authorized." });
});

module.exports = router;

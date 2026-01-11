const express = require("express");
const router = express.Router();
const { saveSecret, getSecret } = require("../services/vaultService");

router.post("/add", (req, res) => {
  try {
    const { title, secret } = req.body;

    saveSecret(title, secret);

    res.status(200).json({ message: "Secret saved successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to save secret", details: err.message });
  }
});

router.get("/:title", (req, res) => {
  try {
    const { title } = req.params;

    const secret = getSecret(title);

    if (!secret) {
      return res.status(404).json({ error: "Secret not found" });
    }

    res.status(200).json({ title, secret });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to retrieve secret", details: err.message });
  }
});

module.exports = router;

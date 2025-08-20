const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

// POST /encrypt
router.post("/encrypt", (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text to encrypt is required." });
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'), // Expecting key to be in hex format
      iv
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const encryptedData = iv.toString("hex") + ":" + encrypted;
    res.json({ encryptedData });
  } catch (error) {
    console.error("Encryption error:", error);
    res.status(500).json({ error: "Failed to encrypt text." });
  }
});

// POST /decrypt
router.post("/decrypt", (req, res) => {
  try {
    const { encryptedData } = req.body;
    if (!encryptedData) {
      return res.status(400).json({ error: "Encrypted data is required." });
    }

    const parts = encryptedData.split(":");
    if (parts.length !== 2) {
      return res.status(400).json({ error: "Invalid encrypted data format." });
    }

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'), // Expecting key to be in hex format
      iv
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    res.json({ decryptedData: decrypted });
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({ error: "Failed to decrypt text. Check the key or IV." });
  }
});

module.exports = router;

const express = require("express");
const multer = require("multer");
const File = require("../models/File");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

// Upload Files Route
router.post("/upload", upload.any(), async (req, res) => {
  try {
    console.log("=== DEBUG INFO ===");
    console.log("req.files:", req.files);
    console.log("req.body:", req.body);
    console.log(
      "Field names received:",
      req.files?.map((f) => f.fieldname)
    );
    console.log("==================");

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    res.status(200).json({
      message: "Debug - Files received!",
      fieldNames: req.files.map((f) => f.fieldname),
      fileDetails: req.files.map((f) => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        size: f.size,
      })),
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Error uploading files: " + error.message);
  }
});

// Get All Files Route
router.get("/", async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).send("Error fetching files: " + error.message);
  }
});

// Get File by ID Route
router.get("/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send("File not found");
    }
    res.status(200).json(file);
  } catch (error) {
    res.status(500).send("Error fetching file: " + error.message);
  }
});

// Delete File by ID Route
router.delete("/:id", async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) {
      return res.status(404).send("File not found");
    }
    res.status(200).send("File deleted successfully!");
  } catch (error) {
    res.status(500).send("Error deleting file: " + error.message);
  }
});

module.exports = router;

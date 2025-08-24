const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const File = require("../models/File");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Check if a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" }, // Cloudinary will auto-detect the file type
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Create a new File document with the data from the upload result
    const newFile = new File({
      name: req.file.originalname,
      url: uploadResult.secure_url,
      cloudinary_id: uploadResult.public_id,
    });

    // Save the file metadata to the MongoDB database
    await newFile.save();

    res.status(201).json(newFile);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error during file upload." });
  }
});

router.get("/files", async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to retrieve files." });
  }
});

module.exports = router;

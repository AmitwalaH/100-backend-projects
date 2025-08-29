const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// POST /api/photos
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { caption } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!imageUrl) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    const photo = new Photo({
      caption,
      imageUrl,
      owner: req.user.id,
    });

    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET /api/photos
router.get("/", async (req, res) => {
  try {
    const photos = await Photo.find().populate("owner", "username email");
    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET /api/photos/my-photos
router.get("/my-photos", protect, async (req, res) => {
  try {
    const photos = await Photo.find({ owner: req.user.id }).populate(
      "owner",
      "username email"
    );
    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching user photos:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

//  DELETE /api/photos/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found." });
    }
    if (photo.owner.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden. You do not own this photo." });
    }

    fs.unlinkSync(photo.imageUrl);

    await photo.remove();
    res.status(200).json({ message: "Photo deleted successfully." });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

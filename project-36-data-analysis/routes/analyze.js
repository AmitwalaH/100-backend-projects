const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const { protect } = require("../middleware/auth");

// Multer Configuration (Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// POST /api/analyze/csv
router.post("/csv", protect, upload.single("csvFile"), async (req, res) => {
  // Ensure the file exists
  if (!req.file) {
    return res.status(400).json({ error: "No CSV file uploaded." });
  }

  const filePath = req.file.path;
  const results = [];

  try {
    // Read and Parse CSV Stream
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv()) // Parse CSV data
        .on("data", (row) => {
          results.push(row);
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (err) => {
          reject(err);
        });
    });

    // Example - Data Analysis Logic (Calculate Revenue)
    // We will calculate Total Revenue, assuming one of the columns is named 'Revenue'
    const totalRevenue = results.reduce((sum, row) => {
      const revenueValue = parseFloat(row.Revenue || 0);
      return sum + revenueValue;
    }, 0);

    // Clean Up and Respond

    // Delete the temporary file from the server
    fs.unlinkSync(filePath);
    res.status(200).json({
      reportName: req.file.originalname,
      totalRows: results.length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      message: "File analyzed successfully.",
    });
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Analysis or File Read Error:", error);
    res.status(500).json({ error: "Failed to process file data." });
  }
});

module.exports = router;

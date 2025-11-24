const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const { protect } = require("../middleware/auth");

// Multer Configuration (Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// POST /api/analyze/csv
router.post("/csv", protect, upload.single("csvFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No CSV file uploaded." });
  }

  const filePath = req.file.path;
  const results = [];

  try {
    // Read & Parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => results.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    // If CSV is in “fully quoted row” format, fix it
    let parsedRows = results;

    // Check for quoted format: one key containing all headers
    const firstRowKeys = Object.keys(results[0]);
    if (firstRowKeys.length === 1 && firstRowKeys[0].includes(",")) {
      const headerLine = firstRowKeys[0].replace(/"/g, "");
      const headers = headerLine.split(",").map((h) => h.trim());

      parsedRows = results.map((row) => {
        const combined = row[firstRowKeys[0]].replace(/"/g, "");
        const values = combined.split(",").map((v) => v.trim());

        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] ?? "";
        });

        return obj;
      });
    }

    // Calculate total revenue
    const totalRevenue = parsedRows.reduce((sum, row) => {
      let value = row.Revenue;

      if (!value) return sum;

      // Remove symbols like $, commas, quotes
      value = value.toString().replace(/[^0-9.-]/g, "");

      const num = parseFloat(value);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

    // Cleanup file
    fs.unlinkSync(filePath);

    res.status(200).json({
      reportName: req.file.originalname,
      totalRows: parsedRows.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      message: "File analyzed successfully.",
    });
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    console.error("CSV Processing Error:", error);
    res.status(500).json({ error: "Failed to process file data." });
  }
});

module.exports = router;

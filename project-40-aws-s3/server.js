const express = require("express");
const dotenv = require("dotenv");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("./config/s3Config");
const upload = require("./middleware/upload");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// @route   POST /api/upload
// @desc    Upload an image to AWS S3
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // 1. Create a unique filename to avoid overwriting files in S3
    const fileName = `uploads/${Date.now()}-${req.file.originalname}`;

    // 2. Prepare the parameters for S3
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer, // The actual file data from memory
      ContentType: req.file.mimetype,
    };

    // 3. Execute the Upload Command
    await s3Client.send(new PutObjectCommand(uploadParams));

    // 4. Construct the file URL (Standard S3 URL format)
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    res.status(200).json({
      success: true,
      message: "File uploaded successfully to AWS S3",
      url: fileUrl,
      key: fileName,
    });
  } catch (error) {
    console.error("AWS Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading to Cloud Storage",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("AWS S3 Image Upload Service is Running");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

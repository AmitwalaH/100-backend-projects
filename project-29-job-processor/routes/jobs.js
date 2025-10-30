const express = require("express");
const router = express.Router();
const { addMailJob } = require("../queue/mailQueue");

// POST /api/jobs/send-mail
router.post("/send-mail", async (req, res) => {
  try {
    const { email, subject, body } = req.body;

    if (!email || !subject || !body) {
      return res
        .status(400)
        .json({ error: "Email, subject, and body are required." });
    }
    // Adding the job to Redis.
    await addMailJob(email, subject, body);

    res.status(202).json({
      message: "Email task accepted and queued for background processing.",
      status: "ACCEPTED",
    });
  } catch (error) {
    console.error("Error adding job to queue:", error);
    res.status(500).json({ error: "Failed to queue job." });
  }
});

module.exports = router;

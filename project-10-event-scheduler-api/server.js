const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Event = require("./models/Event"); 

const app = express();
dotenv.config();

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");

app.use(express.json());
app.use(cors());

const MONGODB_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Background Event Scheduler
setInterval(async () => {
  try {
    const now = new Date();
    // Find events that are due and haven't been sent yet
    const dueEvents = await Event.find({
      isSent: false,
      scheduledTime: { $lte: now },
    }).populate("owner", "username");

    if (dueEvents.length > 0) {
      console.log(`Found ${dueEvents.length} due events. Sending emails...`);
    }

    for (const event of dueEvents) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: event.recipientEmail,
        subject: `Event Reminder: ${event.title}`,
        text: `Hello, this is a reminder for your event: ${event.title}, scheduled for ${event.scheduledTime}.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent for event: ${event.title} to ${event.recipientEmail}`);
        
        // Mark the event as sent in the database
        event.isSent = true;
        await event.save();
      } catch (emailError) {
        console.error(`Failed to send email for event: ${event.title}. Error:`, emailError);
      }
    }
  } catch (dbError) {
    console.error("Error in background event scheduler:", dbError);
  }
}, 60000); // Run every 60 seconds (1 minute)


app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);


app.get("/", (req, res) => {
  res.send("Welcome to the Simple Event Scheduler API!");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

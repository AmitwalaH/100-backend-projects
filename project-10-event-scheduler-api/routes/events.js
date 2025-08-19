const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { protect } = require("../middleware/auth"); // Assuming protect is correctly exported

// POST /api/events
router.post("/", protect, async (req, res) => {
  try {
    const { title, scheduledTime, recipientEmail } = req.body;

    const newEvent = new Event({
      title,
      scheduledTime,
      recipientEmail,
      owner: req.user._id,
    });
    
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// GET /api/events
router.get("/", protect, async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user._id });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// DELETE /api/events/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this event." });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;

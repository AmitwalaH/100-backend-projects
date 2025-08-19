const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  recipientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  isSent: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

EventSchema.pre("save", function (next) {
  if (this.isModified("scheduledTime") && this.scheduledTime < new Date()) {
    return next(new Error("Scheduled time must be in the future"));
  }
  next();
});

module.exports = mongoose.model("Event", EventSchema);

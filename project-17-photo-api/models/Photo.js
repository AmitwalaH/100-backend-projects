const mongoose = require("mongoose");
const PhotoSchema = new mongoose.Schema({
  caption: {
    type: String,
    trim: true,
    maxlength: 100,
    default: "",
  },
  imageUrl: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Photo", PhotoSchema);

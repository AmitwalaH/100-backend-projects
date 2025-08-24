const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  cloudinary_id: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("File", FileSchema);

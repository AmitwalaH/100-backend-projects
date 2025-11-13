const mongoose = require("mongoose");
const AuthoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  bio: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Author", AuthoreSchema);

const mongoose = require("mongoose");

//Create a User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Create a User model
const User = mongoose.model("User", userSchema);
module.exports = User;

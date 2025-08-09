const mongoose = require("mongoose");
const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ingredients: {
    type: [String],
    required: true,
  },
  instructions: {
    type: String,
    required: true,
  },
  cuisineType: {
    type: String,
    required: true,
    enum: ["Italian", "Chinese", "Indian", "Mexican", "American", "Other"],
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["Easy", "Medium", "Hard"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

RecipeSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    return next();
  }
  this.name = this.name.trim();
  next();
});

module.exports = mongoose.model("Recipe", RecipeSchema);

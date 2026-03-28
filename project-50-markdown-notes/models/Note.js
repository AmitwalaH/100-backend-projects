const mongoose = require("mongoose");
const slugify = require("slugify");
const { marked } = require("marked");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  markdown: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  htmlContent: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

noteSchema.pre("validate", function (next) {
  if (this.title) {
    // Convert "My Day 50 Project" to "my-day-50-project"
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if (this.markdown) {
    // Convert "# Hello" to "<h1>Hello</h1>"
    this.htmlContent = marked.parse(this.markdown);
  }

  next();
});

module.exports = mongoose.model("Note", noteSchema);

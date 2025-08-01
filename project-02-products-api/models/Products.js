const mongoose = require("mongoose");
// Create a Product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
});

// Create a Product model
const Product = mongoose.model("Product", productSchema);

module.exports = Product;

const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Products");
const router = express.Router();


// Create a new product
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    // Create new product
    const newProduct = new Product({ name, description, price, category });
    await newProduct.save();

    res.status(201).send("Product created successfully!");
  } catch (error) {
    res.status(500).send("Error creating product: " + error.message);
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send("Error fetching products: " + error.message);
  }
});

// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).send("Error fetching product: " + error.message);
  }
});

// Update a product by ID
router.put("/:id", async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category },
      { new: true }
    );

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.status(200).send("Product updated successfully!");
  } catch (error) {
    res.status(500).send("Error updating product: " + error.message);
  }
});

// Delete a product by ID
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.status(200).send("Product deleted successfully!");
  } catch (error) {
    res.status(500).send("Error deleting product: " + error.message);
  }
});

module.exports = router;

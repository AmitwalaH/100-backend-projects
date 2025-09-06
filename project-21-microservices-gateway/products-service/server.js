const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PRODUCTS_PORT || 3002;

const products = [
  { id: 1, name: "Laptop" },
  { id: 2, name: "Smartphone" },
  { id: 3, name: "Tablet" },
];

// Define the route for this service
app.get("/products", (req, res) => {
  console.log("Products service received a request");
  res.json(products);
});

// Start the server for the microservice
app.listen(PORT, () => {
  console.log(`Products service running on port ${PORT}`);
});

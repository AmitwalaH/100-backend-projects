const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

app.use(express.json());

const USERS_SERVICE_URL = `http://localhost:${process.env.USERS_PORT || 3001}`;
const PRODUCTS_SERVICE_URL = `http://localhost:${
  process.env.PRODUCTS_PORT || 3002
}`;

app.get("/api/users", async (req, res) => {
  try {
    const response = await fetch(`${USERS_SERVICE_URL}/users`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error forwarding request to users service:", error);
    res.status(500).json({ error: "Users service is unavailable" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const response = await fetch(`${PRODUCTS_SERVICE_URL}/products`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error forwarding request to products service:", error);
    res.status(500).json({ error: "Products service is unavailable" });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the API Gateway!");
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

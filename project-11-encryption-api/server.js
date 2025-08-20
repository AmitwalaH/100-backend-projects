const express = require("express");
const dotenv = require("dotenv");

const cryptoRoutes = require("./routes/crypto");

const app = express();
dotenv.config();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use("/api", cryptoRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Simple Encryption API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

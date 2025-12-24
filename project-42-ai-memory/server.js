const express = require("express");
const dotenv = require("dotenv");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Day 42: AI Memory Server running on port ${PORT}`);
});

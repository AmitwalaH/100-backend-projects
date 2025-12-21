const express = require("express");
const dotenv = require("dotenv");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

// 4. Start the server
app.listen(PORT, () => {
  console.log(`AI Server is listening on port ${PORT}`);
});

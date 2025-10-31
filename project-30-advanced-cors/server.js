const express = require("express");
const dotenv = require("dotenv");
const secureRouter = require("./routes/secure");

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;
app.use(express.json());

app.use("/api", secureRouter);

app.get("/", (req, res) => {
  res.send("CORS API is running on Port 3000.");
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log(
    `Test client on a different port (e.g., 5500) to see CORS in action.`
  );
});

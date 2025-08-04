const express = require("express");
const dotenv = require("dotenv");
const app = express();
dotenv.config();
const movieRoutes = require("./routes/movies");

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Movie Search API!");
});

app.use("/api/movies", movieRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

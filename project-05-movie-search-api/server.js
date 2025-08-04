const express = require("express");
const dotenv = require("dotenv");
const app = express();
const movieRoutes = require("./routes/movies");

dotenv.config();

const PORT = process.env.PORT || 3000;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const MOVIE_API_URL = "https://api.themoviedb.org/3/search/movie";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Movie Search API!");
});

app.use("/api/movies", movieRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

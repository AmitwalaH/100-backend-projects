const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY; // Insert your TMDB API key here
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB API returned a status of ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching movie search results:", error);
    res.status(500).json({ error: "Failed to fetch movies from external API" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Movie ID is required" });
    }

    const url = `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB API returned a status of ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch movie details from external API" });
  }
});

module.exports = router;

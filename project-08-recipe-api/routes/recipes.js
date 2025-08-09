const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const { protect } = require("../middleware/auth"); 

// POST /api/recipes
router.post("/", protect, async (req, res) => {
  try {
    // Extracting recipe details from request body
    const { name, ingredients, instructions, cuisineType, difficulty } =
      req.body;

    // Create a new recipe and assign the authenticated user as the owner
    const newRecipe = new Recipe({
      name,
      ingredients,
      instructions,
      cuisineType,
      difficulty,
      owner: req.user._id,
    });

    // Save the new recipe to the database
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// GET /api/recipes
router.get("/", async (req, res) => {
  try {
    const filter = {};
    const { cuisineType, difficulty } = req.query;

    // Building the query filter based on parameters
    if (cuisineType) {
      filter.cuisineType = cuisineType;
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const recipes = await Recipe.find(filter).populate(
      "owner",
      "username email"
    );
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// GET /api/recipes/:id
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "owner",
      "username email"
    );
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error fetching single recipe:", error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

// PUT /api/recipes/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Check if the authenticated user is the owner
    if (recipe.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this recipe." });
    }

    recipe.name = req.body.name || recipe.name;
    recipe.ingredients = req.body.ingredients || recipe.ingredients;
    recipe.instructions = req.body.instructions || recipe.instructions;
    recipe.cuisineType = req.body.cuisineType || recipe.cuisineType;
    recipe.difficulty = req.body.difficulty || recipe.difficulty;

    const updatedRecipe = await recipe.save();
    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

//DELETE /api/recipes/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Check if the authenticated user is the owner
    if (recipe.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this recipe." });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

module.exports = router;

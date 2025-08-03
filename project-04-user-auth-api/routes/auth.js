const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const {
  validateUserRegistration,
  validateUserLogin,
  checkDuplicateUser,
} = require("../utils/validation");

// User Registration Route
router.post(
  "/register",
  validateUserRegistration,
  checkDuplicateUser,
  async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email, password });
      await user.save();
      const token = user.generateAuthToken();
      res.status(201).json({
        message: "User registered successfully",
        token: token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error during registration" });
    }
  }
);

// User Login Route
router.post("/login", validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = user.generateAuthToken();

    res.status(200).json({
      message: "User logged in successfully",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// User Profile Route (Protected)
router.get("/profile", protect, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      message: "Profile data fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

module.exports = router;
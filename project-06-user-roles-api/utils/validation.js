const { body, validationResult } = require("express-validator");
const User = require("../models/User"); // Import the User model here

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

const validateUserRegistration = [
  // Username validation
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  // Email validation
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  // Password validation
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  handleValidationErrors,
];

const validateUserLogin = [
  // Email validation
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  // Password validation
  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

const checkDuplicateUser = async (req, res, next) => {
  const { username, email } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already registered" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }
    next();
  } catch (error) {
    console.error("Error checking for duplicate user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  checkDuplicateUser,
};

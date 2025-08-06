const express = require("express");
const { protect } = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const userModel = require("../models/User"); // Correctly imported User model
const router = express.Router();

//route   GET /api/admin/users
router.get("/users", protect, authorize(["admin"]), async (req, res) => {
  try {
    // Fetch all users from the database, excluding their passwords
    const users = await userModel.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

//route   GET /api/admin/users/:id
router.get("/users/:id", protect, authorize(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    // Find a user by ID, excluding their password
    const user = await userModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

//route   DELETE /api/admin/users/:id
router.delete("/users/:id", protect, authorize(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    // Find and delete the user by ID
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

//route   PUT /api/admin/users/:id/role
router.put(
  "/users/:id/role",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Validate the incoming role
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    try {
      const user = await userModel
        .findByIdAndUpdate(id, { role }, { new: true })
        .select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  }
);
module.exports = router;

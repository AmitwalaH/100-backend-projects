const express = require("express");
const router = express.Router();
const WorkoutPlan = require("../models/WorkoutPlan");
const { protect } = require("../middleware/auth");
const mongoose = require("mongoose");

const checkPlanOwnership = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ error: "Workout plan not found." });
    }

    // Converting the ObjectId to a string for comparison
    if (plan.user.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({
          error: "Forbidden. You do not have permission to this workout plan.",
        });
    }
    req.plan = plan;
    next();
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid plan ID format." });
    }
    res.status(500).json({ error: "Server error during ownership check." });
  }
};

// POST /api/workouts
router.post("/", protect, async (req, res) => {
  try {
    const { planName, exercises, scheduleDate, notes } = req.body;

    const newPlan = new WorkoutPlan({
      planName,
      exercises,
      scheduleDate,
      notes,
      user: req.user.id, // Link to the authenticated user
    });

    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(400).json({ error: error.message || "Invalid data provided." });
  }
});

// GET /api/workouts
router.get("/", protect, async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ user: req.user.id })
      .sort({ scheduleDate: 1 })
      .select("-__v");

    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching workout list." });
  }
});

// GET /api/workouts/reports
// Listing all completed workouts
router.get("/reports", protect, async (req, res) => {
  try {
    const completedPlans = await WorkoutPlan.find({
      user: req.user.id,
      isComplete: true,
    }).sort({ scheduleDate: -1 });

    res.status(200).json(completedPlans);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching workout reports." });
  }
});

// PUT /api/workouts/:id/complete
router.put("/:id/complete", protect, checkPlanOwnership, async (req, res) => {
  try {
    const plan = req.plan;

    plan.isComplete = true;
    await plan.save();

    res.status(200).json(plan);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server error marking workout as complete." });
  }
});

// DELETE /api/workouts/:id
router.delete("/:id", protect, checkPlanOwnership, async (req, res) => {
  try {
    await WorkoutPlan.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Workout plan deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server error deleting workout plan." });
  }
});

module.exports = router;

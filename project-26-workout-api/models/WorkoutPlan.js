const mongoose = require('mongoose');
const ExerciseSchema = require('./Exercise'); // Import the sub-schema

const WorkoutPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    planName: {
        type: String,
        required: true,
        trim: true,
    },
    exercises: [ExerciseSchema],
    scheduleDate: {
        type: Date,
        required: true,
    },
    notes: {
        type: String,
        default: 'No notes.',
    },
    isComplete: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);
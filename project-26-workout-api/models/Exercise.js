const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    repetitions: {
        type: Number,
        required: true,
        min: 1,
    },
    sets: {
        type: Number,
        required: true,
        min: 1,
    },
    weight: {
        type: String, 
        required: true,
    },
});

// We will export the schema, not model, because it will be embedded in WorkoutPlan.
module.exports = ExerciseSchema;
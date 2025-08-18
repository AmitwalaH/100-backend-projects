const mongoose = require("mongoose");
const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  choices: {
    type: [String],
    required: true,
    validate: [arrayLimit, "{PATH} must have at least 2 options"],
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return this.choices.includes(v);
      },
      message: (props) => `${props.value} is not a valid answer option!`,
    },
  },
});

function arrayLimit(val) {
  return val.length >= 2;
}


QuestionSchema.methods.isCorrectAnswer = function (answer) {
  return this.answer === answer;
};
module.exports = mongoose.model("Question", QuestionSchema);

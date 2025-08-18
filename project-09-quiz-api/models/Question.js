const mongoose = require("mongoose");
const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, "{PATH} must have at least 2 options"],
  },
  answer: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return this.options.includes(v);
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

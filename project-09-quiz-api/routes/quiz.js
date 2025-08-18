const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const { protect } = require("../middleware/auth"); // Assuming protect is correctly exported


// GET /api/quiz/questions
router.get("/questions", async (req, res) => {
  try {
    // We'll get a random selection of 10 questions for the quiz
    const questions = await Question.aggregate([
      { $sample: { size: 10 } },
      { $project: { correctAnswer: 0, __v: 0 } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ error: "No questions found in the database" });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({ error: "Server error while fetching questions" });
  }
});

//  POST /api/quiz/answer
//  Check if the user's answer is correct
router.post("/answer", async (req, res) => {
  const { id, answer } = req.body;

  if (!id || !answer) {
    return res.status(400).json({ error: "Question ID and answer are required" });
  }

  try {
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Use the custom method from the schema to check the answer
    const isCorrect = question.isCorrectAnswer(answer);

    res.status(200).json({ isCorrect });
  } catch (error) {
    console.error("Error checking answer:", error);
    res.status(500).json({ error: "Server error while checking answer" });
  }
});


//   POST /api/quiz/add-question
//   Add a new question to the database (Protected)
//   (for authenticated users)
router.post("/add-question", protect, async (req, res) => {
  try {
    const { question, choices, correctAnswer } = req.body;
    
    const newQuestion = new Question({
      question,
      choices,
      correctAnswer
    });
    
    await newQuestion.save();
    
    res.status(201).json({ message: "Question added successfully", question: newQuestion });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ error: "Server error while adding question" });
  }
});

module.exports = router;

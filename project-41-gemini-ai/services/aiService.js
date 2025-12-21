const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Connection to Gemini AI Service
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Function to get a response from Gemini
 * @param {string} userPrompt - The question from the user
 */
const getGeminiResponse = async (userPrompt) => {
  try {
    // Select the "gemini-1.5-flash" model.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate the content
    const result = await model.generateContent(userPrompt);

    // Extract the actual text from the AI's response object
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini AI Service Error:", error);
    throw new Error("The AI Brain is currently busy or offline.");
  }
};

module.exports = { getGeminiResponse };

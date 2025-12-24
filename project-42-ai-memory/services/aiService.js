const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @param {string} message - The new user input
 * @param {Array} history - The chat history array
 */
const getChatResponse = async (message, history = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // If history is empty, it starts a fresh conversation.
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Memory Service Error:", error);
    throw new Error("AI could not process this conversation turn.");
  }
};

module.exports = { getChatResponse };

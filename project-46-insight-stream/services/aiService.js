const fetch = require("node-fetch");

const apiKey = "";

// Helper for backoff
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const researchQuery = async (userQuery) => {


  for (let retryCount = 0; retryCount <= 5; retryCount++) {
    try {
      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        tools: [{ google_search: {} }],
      };
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        },
      );
      const result = await response.json();

      let answer = result.candidates?.[0]?.content?.parts?.[0]?.text;

      const source =
        data.candidates?.[0]?.groundingMetadata?.groundingAttributions?.map(
          (a) => ({ uri: a.web?.uri, title: a.web?.title }),
        ) || [];

      return { answer, source };

    } catch (error) {
      if (retryCount < 5) {
        await wait(Math.pow(2, retryCount) * 1000);
      }
      if (retryCount === 5) {
        throw new Error("The AI Brain is currently busy or offline.");
      }
    }
  }
};

module.exports = { researchQuery };

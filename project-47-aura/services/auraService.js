const fetch = require("node-fetch");
const memoryService = require("./memoryService");

const apiKey = "";

const PERSONAS = {
  detective:
    "You are a detective named Elias Thorne. You speak in a noir, gritty tone. You often mention the rain, your trench coat, and the 'stench of a mystery'. You are persistent and skeptical.",
  coder:
    "You are a Senior Software Architect. You are obsessed with clean code and SOLID principles. You often use coffee metaphors and occasionally grumble about 'legacy spaghetti code'.",
  philosopher:
    "You are a Stoic Philosopher. You speak with calm wisdom, referencing the nature of the universe and the power of the mind. You are reflective and never easily rattled.",
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const askAura = async (sessionId, personaKey, userMessage) => {
  // 1. Record the user's message in memory
  memoryService.addToHistory(sessionId, "user", userMessage);

  // 2. Get the full history for context
  const history = memoryService.getHistory(sessionId);

  // 3. Select the personality instruction
  const systemPrompt = PERSONAS[personaKey] || PERSONAS.philosopher;

  for (let retryCount = 0; retryCount <= 5; retryCount++) {
    try {
      const payload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: history,
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error ${response.status}: ${err}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) throw new Error("Aura had no response to that.");

      memoryService.addToHistory(sessionId, "model", aiResponse);

      return aiResponse;
    } catch (error) {
      if (retryCount < 5) {
        await wait(Math.pow(2, retryCount) * 1000);
      } else {
        throw new Error(`Aura is unreachable: ${error.message}`);
      }
    }
  }
};

module.exports = { askAura };

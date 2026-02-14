const sessions = {};

const MEMORY_LIMIT = 10;


const getHistory = (sessionId) => {
    if (!sessions[sessionId]) {
        sessions[sessionId] = [];
    }
    return sessions[sessionId];
};


const addToHistory = (sessionId, role, text) => {
    if (!sessions[sessionId]) {
        sessions[sessionId] = [];
    }

    // Gemini specific schema
    sessions[sessionId].push({
        role: role === 'assistant' ? 'model' : role, // Gemini uses 'model' instead of 'assistant'
        parts: [{ text }]
    });

    // Keeping only the most recent messages (Sliding Window)
    if (sessions[sessionId].length > MEMORY_LIMIT) {
        sessions[sessionId] = sessions[sessionId].slice(-MEMORY_LIMIT);
    }
};

module.exports = {
    getHistory,
    addToHistory
};
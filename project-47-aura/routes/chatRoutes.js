const express = require('express');
const router = express.Router();
const { askAura } = require('../services/auraService');

router.post('/chat', async (req, res) => {
    try {
        const { sessionId, message, persona } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ error: 'sessionId and message are required.' });
        }

        const selectedPersona = persona || 'philosopher';
        const auraResponse = await askAura(sessionId, selectedPersona, message);

        res.json({
            success: true,
            persona: selectedPersona,
            response: auraResponse
        });

    } catch (error) {
        console.error('Aura Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
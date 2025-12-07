const express = require('express');
const dotenv = require('dotenv');

const analyzeRouter = require('./routes/analyze'); 
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/analyze', analyzeRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Simple Sentiment Analysis API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
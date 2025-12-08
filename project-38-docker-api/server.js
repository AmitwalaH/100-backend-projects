const express = require('express');
const cors = require('cors');
const weatherRouter = require('./routes/weather');
const dotenv = require('dotenv');

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

app.use(cors());

app.use(express.json());
app.use('/api/weather', weatherRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Weather API Wrapper Service!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

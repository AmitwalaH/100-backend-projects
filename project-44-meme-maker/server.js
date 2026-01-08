const express = require('express');
const app = express();
const memeRoutes = require('./routes/memeRoutes');
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/meme', memeRoutes);
app.listen(PORT, () => {
  console.log(`Meme Maker server running on port ${PORT}`);
});

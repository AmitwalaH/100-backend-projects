const express = require('express');
const app = express();
const PORT = 3000;

require('dotenv').config();

const vaultRoutes = require('./routes/vaultRoutes');
app.use(express.json());

app.use('/api/vault', vaultRoutes);
app.get('/', (req, res) => {
  res.send('SecureBox Vault API is active.');
});

app.listen(PORT, () => {
  console.log(`
  Locked & Loaded! 
  SecureBox running on http://localhost:${PORT}
  `);
});
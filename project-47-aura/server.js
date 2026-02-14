const express = require("express");
const dotenv = require("dotenv");
const chatRoutes = require("./routes/chatRoutes");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.send(`
    Aura: Context-Aware Persona Engine
    ------------------------------------`);
});

app.listen(PORT, () => {
  console.log(`
    Aura: Context-Aware Persona Engine
    ------------------------------------
    Ready for personality-driven investigation.
    `);
});

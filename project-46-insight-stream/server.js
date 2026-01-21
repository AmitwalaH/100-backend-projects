const express = require("express");
const researchRoutes = require("./routes/researchRoutes");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/api", researchRoutes);

app.listen(PORT, () => {
  console.log(`AI Server is listening on port ${PORT}`);
});

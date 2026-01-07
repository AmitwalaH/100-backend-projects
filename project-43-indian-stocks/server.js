const express = require("express");
const marketRoutes = require("./routes/marketRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/stocks", marketRoutes);
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Indian Stock Market API is running",
    endpoints: {
      fetch_stock: "/api/stocks/:symbol",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

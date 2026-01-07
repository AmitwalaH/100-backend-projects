const express = require("express");
const stockRoutes = require("./routes/stockRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/stocks", stockRoutes);
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

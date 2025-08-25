const express = require("express");
const app = express();
const scrapeRouter = require("./routes/scrape");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", scrapeRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

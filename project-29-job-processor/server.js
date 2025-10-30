const express = require("express");
const dotenv = require("dotenv");
require("./queue/worker"); // Start the worker
const jobsRouter = require("./routes/jobs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/", jobsRouter);
app.use("/api/jobs", jobsRouter);

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

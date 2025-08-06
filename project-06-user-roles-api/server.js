const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Import your route files
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());

// --- Database Connection ---
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process on connection failure
  });

// --- Route Mounting ---

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the User Management API with Role-Based Authorization!");
});

app.use((err, req, res, next) => {
  console.error("Caught unhandled error:", err.stack); // Log the full error stack
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require("express");
const mongoose = require("mongoose");
const postsRouter = require("./routes/posts");
const authRouter = require("./routes/auth");
const session = require("express-session");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/blog", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Middleware to parse JSON bodies
app.use(express.json());

// Add this after express.json()
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Blog API");
});
// Session middleware

// Add this before your routes
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/auth", authRouter);
app.use("/posts", postsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

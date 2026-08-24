require("dotenv").config();

const PORT = Number(process.env.PORT) || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "";
const NODE_ENV = process.env.NODE_ENV || "development";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "http://localhost:5173").split(",").map((origin) => origin.trim());
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 30);

if (!MONGODB_URI) {
  console.warn("[backend] WARNING: MONGODB_URI is not configured. Live sandbox demo routes require a MongoDB connection.");
}

module.exports = {
  PORT,
  MONGODB_URI,
  NODE_ENV,
  ALLOWED_ORIGINS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
};

const rateLimit = require("express-rate-limit");

// A simple rate limiter that allows a maximum of 10 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many requests from this IP, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = apiLimiter;

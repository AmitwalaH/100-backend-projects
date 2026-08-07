const rateLimit = require("express-rate-limit");
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } = require("../config");

// Rate limit is configured in api/config.js to keep demo traffic predictable.
module.exports = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: `Too many requests — demo API is rate limited to ${RATE_LIMIT_MAX} req/min per IP.`,
  },
  keyGenerator: (req) => `${req.ip}:${req.params.project || "global"}`,
});

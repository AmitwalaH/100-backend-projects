const cors = require("cors");
const { ALLOWED_ORIGINS, NODE_ENV } = require("../config");

module.exports = cors({
  origin: (origin, callback) => {
    if (!origin && NODE_ENV !== "production") {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
});

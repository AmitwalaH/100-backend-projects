const winston = require("winston");
const morgan = require("morgan");

const logger = winston.createLogger({
  // Only log messages at 'info' level
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      // Format: [YYYY-MM-DD HH:mm:ss] level: message
      (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
  ),
  transports: [
    // Transport 1: Console
    new winston.transports.Console({
      level: "info", // Show info and higher levels in console
      format: winston.format.colorize({ all: true }),
    }),

    // Transport 2: File
    new winston.transports.File({
      filename: "logs/access.log",
      level: "info",
    }),
  ],
});

// Custom Stream for Morgan
const stream = {
  write: (message) => {
    // Morgan provides the formatted HTTP log string (e.g. "GET /api/posts 200 - 5ms").
    // We trim whitespace and pass this string to Winston as an 'info' level message.
    logger.info(message.trim());
  },
};

//

// Morgan Middleware
const morganMiddleware = morgan(
  // The log format: method URL status response-time ms (e.g., POST /api/posts 201 - 12ms)
  ":method :url :status :response-time ms",
  { stream }
);

module.exports = {
  logger,
  morganMiddleware,
};

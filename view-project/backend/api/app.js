const express = require("express");
const corsMiddleware = require("./middleware/cors");
const rateLimitMiddleware = require("./middleware/rateLimit");
const sanitizeMiddleware = require("./middleware/sanitize");
const demoRouter = require("./routes/demo");
const projectConfigRouter = require("./routes/projectConfig");
const projectRequestRouter = require("./routes/projectRequest");

const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: "50kb" }));
app.use(sanitizeMiddleware);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

app.use("/api/demo", rateLimitMiddleware, demoRouter);
app.use("/api/project-config", rateLimitMiddleware, projectConfigRouter);
app.use("/api/project-request", rateLimitMiddleware, projectRequestRouter);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
});

module.exports = app;

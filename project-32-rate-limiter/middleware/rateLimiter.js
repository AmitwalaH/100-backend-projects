const { checkRateLimit } = require("../strategies/slidingWindow");

module.exports = (redisClient) => {
  const rateChecker = checkRateLimit(redisClient);

  return (maxRequests, windowSizeMs) => async (req, res, next) => {
    const key = req.ip;

    try {
      const result = await rateChecker(key, windowSizeMs, maxRequests);
      res.set("RateLimit-Limit", maxRequests);
      res.set("RateLimit-Remaining", result.remaining);

      if (result.allowed) {
        next();
      } else {
        // Request is DENIED
        res.status(429).json({
          error: "Too many requests.",
          message: `Limit of ${maxRequests} requests exceeded. Try again in ${
            windowSizeMs / 1000
          } seconds.`,
        });
      }
    } catch (error) {
      console.error("Rate Limiter Failed:", error);
      next();
    }
  };
};
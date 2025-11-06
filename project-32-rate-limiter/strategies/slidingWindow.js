const ONE_MINUTE_IN_MS = 60 * 1000;
const MAX_REQUESTS = 10;

module.exports = (redisClient) => {
  const checkRateLimit = async (
    key,
    windowSizeMs = ONE_MINUTE_IN_MS,
    maxRequests = MAX_REQUESTS
  ) => {
    const now = Date.now();
    const cleanUpTime = now - windowSizeMs;

    const redisKey = `rate_limit:${key}`;

    const multi = redisClient.multi();

    // 1. ZREMRANGEBYSCORE: Cleaning up the window by removing all old req
    multi.zremrangebyscore(redisKey, 0, cleanUpTime);

    // 2. ZADD: Adding the current request timestamp to the Sorted Set.
    multi.zadd(redisKey, now, now);

    // 3. EXPIRE: Ensure the key expires after the window size, preventing eternal keys.
    multi.expire(redisKey, windowSizeMs / 1000);

    // 4. ZCARD: Get the count of remaining requests in the current window.
    multi.zcard(redisKey);

    // Execute all commands
    const results = await multi.exec();

    const requestCount = results[results.length - 1][1];

    if (requestCount > maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    // Request is allowed
    return { allowed: true, remaining: maxRequests - requestCount };
  };

  return { checkRateLimit };
};

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 60 });

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;

  const cachedData = myCache.get(key);

  if (cachedData) {
    console.log("Cache hit for:", key);
    return res.status(200).json(cachedData);
  }

  const originalJson = res.json;
  res.json = (body) => {
    myCache.set(key, body, 60);
    originalJson.call(res, body);
  };

  next();
};

module.exports = cacheMiddleware;

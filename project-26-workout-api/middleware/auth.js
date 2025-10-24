const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes by verifying JWTs
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      // Handle errors if the token is invalid or expired
      console.error("JWT verification failed:", error);
      res.status(401).json({ error: "Not authorized, token failed." });
    }
  }

  // 7. If no token is provided in the request headers
  if (!token) {
    res.status(401).json({ error: "Not authorized, no token." });
  }
};

module.exports = { protect };

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure req.user exists (meaning the protect middleware ran successfully)
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Not authorized, no user information available." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // If the user's role is not allowed, send a 403 Forbidden response
      return res
        .status(403)
        .json({ error: "Forbidden, insufficient permissions." });
    }

    next();
  };
};

module.exports = authorize;

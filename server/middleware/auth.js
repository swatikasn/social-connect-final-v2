const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Authentication required" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (_error) {
    res.status(401).json({ message: "Session expired or invalid" });
  }
};

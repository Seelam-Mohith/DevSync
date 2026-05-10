const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("[MIDDLEWARE] Auth check:", {
      hasAuthHeader: !!authHeader,
      headerPreview: authHeader ? authHeader.substring(0, 20) + "..." : "none",
    });

    if (!authHeader) {
      console.warn("[MIDDLEWARE] No Authorization header provided");
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.warn("[MIDDLEWARE] Invalid Authorization header format", {
        format: authHeader.substring(0, 20),
      });
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header format. Use: Bearer <token>",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.warn("[MIDDLEWARE] No token provided");
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("[MIDDLEWARE] JWT_SECRET not configured");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    console.log("[MIDDLEWARE] Verifying JWT token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[MIDDLEWARE] JWT verified", { userId: decoded.userId });

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.warn("[MIDDLEWARE] User not found", { userId: decoded.userId });
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("[MIDDLEWARE] Auth successful", { userId: user._id, email: user.email });
    req.user = user;
    next();
  } catch (error) {
    console.error("[MIDDLEWARE] Auth error:", {
      message: error.message,
      name: error.name,
    });

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = { protect };

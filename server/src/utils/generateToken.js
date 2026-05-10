const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error("[TOKEN] JWT_SECRET is not configured");
    throw new Error("JWT_SECRET is not configured");
  }

  if (!userId) {
    console.error("[TOKEN] userId is required");
    throw new Error("userId is required");
  }

  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
    console.log("[TOKEN] Token generated successfully for user", { userId });
    return token;
  } catch (error) {
    console.error("[TOKEN] Error generating token", { error: error.message });
    throw error;
  }
};

module.exports = generateToken;

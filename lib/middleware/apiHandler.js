const { connectDB } = require("../db");

function setCorsHeaders(res, origin) {
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
}

async function apiHandler(req, res, { methods, auth, handler }) {
  if (req.method === "OPTIONS") {
    setCorsHeaders(res, req.headers.origin);
    return res.status(200).end();
  }

  setCorsHeaders(res, req.headers.origin);

  if (methods && !methods.includes(req.method)) {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDB();

    if (auth) {
      const { protect } = require("./auth");
      const user = await protect(req);
      if (!user) {
        return res.status(401).json({ success: false, message: "Not authorized" });
      }
      req.user = user;
    }

    return await handler(req, res);
  } catch (error) {
    console.error("[API Error]", error.message);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = { apiHandler, setCorsHeaders };

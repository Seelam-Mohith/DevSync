const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const leetcodeRoutes = require("./routes/leetcodeRoutes");
const githubRoutes = require("./routes/githubRoutes");
// const codolioRoutes = require("./routes/codolioRoutes"); // Disabled for Node.js 18 compatibility
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// CORS Configuration - Allow frontend to communicate with backend
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true, // Allow cookies and authorization headers
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

console.log("[APP] CORS Configuration:");
console.log(`  - Origin: ${corsOptions.origin}`);
console.log(`  - Credentials: ${corsOptions.credentials}`);
console.log(`  - Methods: ${corsOptions.methods.join(", ")}`);

// Middleware Setup
app.use(cors(corsOptions));

// Body parsing middleware (CRITICAL for receiving JSON data)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method.padEnd(6)} ${req.path}`);
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    console.log(`  Body: ${JSON.stringify(req.body).substring(0, 100)}...`);
  }
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DevSync API Server",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      user: "/api/user",
      activity: "/api/activity",
      leaderboard: "/api/leaderboard",
      github: "/api/github",
      codolio: "/api/codolio",
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/github", githubRoutes);
// app.use("/api/codolio", codolioRoutes); // Disabled for Node.js 18 compatibility

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;

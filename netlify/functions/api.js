const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const { connectDB } = require("../../lib/db");

const { register, login } = require("../../lib/controllers/authController");
const { getProfile, updateProfile, getUserById } = require("../../lib/controllers/userController");
const { getMyActivities } = require("../../lib/controllers/activityController");
const { getLeaderboard } = require("../../lib/controllers/leaderboardController");
const { getLeetCodeStats } = require("../../lib/controllers/leetcodeController");
const { getGitHubStats } = require("../../lib/controllers/githubController");
const {
  createSquad,
  joinSquad,
  getSquad,
  getUserSquad,
  getSquadLeaderboard,
  leaveSquad,
  deleteSquad,
} = require("../../lib/controllers/squadController");
const { protect } = require("../../lib/middleware/auth");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  if (req.body && typeof req.body === "string") {
    try { req.body = JSON.parse(req.body); } catch {}
  }
  if (!req.body && req.method !== "GET" && req.method !== "HEAD") {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
      next();
    });
    return;
  }
  next();
});

app.use((req, res, next) => {
  if (req.url.startsWith("/.netlify/functions/api")) {
    req.url = req.url.replace(/^\/\.netlify\/functions\/api/, "") || "/";
  }
  next();
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

const auth = async (req, res, next) => {
  try {
    const user = await protect(req);
    if (!user) return res.status(401).json({ success: false, message: "Not authorized" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

app.post("/auth/register", register);
app.post("/auth/login", login);

app.get("/user/profile", auth, getProfile);
app.put("/user/profile", auth, updateProfile);
app.get("/user/:id", auth, getUserById);

app.get("/activity", auth, getMyActivities);
app.get("/leaderboard", auth, getLeaderboard);
app.get("/leetcode/:username", auth, getLeetCodeStats);
app.get("/github/:username", auth, getGitHubStats);

app.post("/squads", auth, createSquad);
app.delete("/squads", auth, deleteSquad);
app.post("/squads/join", auth, joinSquad);
app.get("/squads/my-squad", auth, getUserSquad);
app.get("/squads/:id", auth, getSquad);
app.get("/squads/:id/leaderboard", auth, getSquadLeaderboard);
app.post("/squads/leave", auth, leaveSquad);

app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

app.post("/debug", (req, res) => {
  res.json({ success: true, body: req.body, contentType: req.headers["content-type"] });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports.handler = serverless(app);

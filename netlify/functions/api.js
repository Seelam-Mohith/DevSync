const { connectDB } = require("../../lib/db");

const { register, login, githubAuth, githubCallback } = require("../../lib/controllers/authController");
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

function setCors(res, event) {
  const origin = event.headers?.origin || "*";
  res.headers = res.headers || {};
  res.headers["Access-Control-Allow-Origin"] = origin;
  res.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
  res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  res.headers["Access-Control-Allow-Credentials"] = "true";
}

function json(res, status, body) {
  return {
    statusCode: status,
    headers: { ...res.headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function parseBody(event) {
  if (!event.body) return {};
  let raw = event.body;
  if (event.isBase64Encoded) {
    raw = Buffer.from(raw, "base64").toString("utf-8");
  }
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

async function authGuard(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  if (!token || !process.env.JWT_SECRET) return null;
  const jwt = require("jsonwebtoken");
  const User = require("../../lib/models/User");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    return user || null;
  } catch {
    return null;
  }
}

function matchRoute(method, path, pattern, patternMethod) {
  if (method !== patternMethod && patternMethod !== "*") return null;
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

function makeReq(event, body) {
  let path = event.path || "/";
  path = path.replace(/^\/\.netlify\/functions\/api/, "").replace(/^\/api/, "") || "/";
  return {
    headers: event.headers || {},
    method: event.httpMethod,
    url: path,
    params: {},
    body,
    query: event.queryStringParameters || {},
  };
}

const routes = [
  ["POST", "/auth/register", false, register],
  ["POST", "/auth/login", false, login],
  ["GET", "/auth/github", false, githubAuth],
  ["GET", "/auth/github/callback", false, githubCallback],
  ["GET", "/user/profile", true, getProfile],
  ["PUT", "/user/profile", true, updateProfile],
  ["GET", "/user/:id", true, getUserById],
  ["GET", "/activity", true, getMyActivities],
  ["GET", "/leaderboard", true, getLeaderboard],
  ["GET", "/leetcode/:username", true, getLeetCodeStats],
  ["GET", "/github/:username", true, getGitHubStats],
  ["POST", "/squads", true, createSquad],
  ["DELETE", "/squads", true, deleteSquad],
  ["POST", "/squads/join", true, joinSquad],
  ["GET", "/squads/my-squad", true, getUserSquad],
  ["GET", "/squads/:id", true, getSquad],
  ["GET", "/squads/:id/leaderboard", true, getSquadLeaderboard],
  ["POST", "/squads/leave", true, leaveSquad],
];

exports.handler = async (event) => {
  const corsRes = { headers: {} };
  setCors(corsRes, event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsRes.headers, body: "" };
  }

  let path = event.path || "/";
  path = path.replace(/^\/\.netlify\/functions\/api/, "").replace(/^\/api/, "") || "/";
  const method = event.httpMethod;

  if (path === "/health" && method === "GET") {
    return json(corsRes, 200, { success: true, status: "ok", timestamp: new Date().toISOString() });
  }

  const body = parseBody(event);
  const req = makeReq(event, body);

  try {
    await connectDB();
  } catch (err) {
    return json(corsRes, 500, { success: false, message: "Database connection failed" });
  }

  for (const [routeMethod, pattern, needsAuth, handler] of routes) {
    const params = matchRoute(method, path, pattern, routeMethod);
    if (params) {
      req.params = params;
      if (needsAuth) {
        const user = await authGuard(event);
        if (!user) return json(corsRes, 401, { success: false, message: "Not authorized" });
        req.user = user;
      }
      try {
        const result = await new Promise((resolve, reject) => {
          const fakeRes = {
            status: (s) => ({
              json: (data) => resolve({ type: "json", status: s, body: data }),
              end: () => resolve({ type: "json", status: s, body: "" }),
              redirect: (url) => resolve({ type: "redirect", status: s, url }),
            }),
            json: (data) => resolve({ type: "json", status: 200, body: data }),
            redirect: (url) => resolve({ type: "redirect", status: 302, url }),
            end: () => resolve({ type: "json", status: 200, body: "" }),
          };
          try {
            const r = handler(req, fakeRes);
            if (r && typeof r.then === "function") r.then(resolve).catch(reject);
          } catch (e) {
            reject(e);
          }
        });
        if (result.type === "redirect") {
          return {
            statusCode: result.status,
            headers: { ...corsRes.headers, Location: result.url },
            body: "",
          };
        }
        return json(corsRes, result.status, result.body);
      } catch (err) {
        return json(corsRes, err.status || 500, { success: false, message: err.message || "Internal server error" });
      }
    }
  }

  return json(corsRes, 404, { success: false, message: "Endpoint not found" });
};

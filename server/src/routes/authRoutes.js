const express = require("express");
const { login, register, githubAuth, githubCallback } = require("../controllers/authController");

const router = express.Router();

console.log("[ROUTES] Setting up auth routes");

// POST /api/auth/register
router.post("/register", (req, res, next) => {
  console.log("[AUTH] POST /register", { body: Object.keys(req.body) });
  register(req, res, next);
});

// POST /api/auth/login
router.post("/login", (req, res, next) => {
  console.log("[AUTH] POST /login", { body: Object.keys(req.body) });
  login(req, res, next);
});

// GET /api/auth/github — initiate GitHub OAuth
router.get("/github", (req, res) => {
  console.log("[AUTH] GET /auth/github");
  githubAuth(req, res);
});

// GET /api/auth/github/callback — handle GitHub OAuth callback
router.get("/github/callback", (req, res, next) => {
  console.log("[AUTH] GET /auth/github/callback", { hasCode: !!req.query.code });
  githubCallback(req, res, next);
});

module.exports = router;

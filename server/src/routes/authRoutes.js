const express = require("express");
const { login, register } = require("../controllers/authController");

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

module.exports = router;

const express = require("express");
const { getLeetCodeStats } = require("../controllers/leetcodeController");
const { protect } = require("../middleware/authMiddleware"); // Optional: if you want only logged-in users to fetch this

const router = express.Router();

// GET /api/leetcode/:username
// Using 'protect' to ensure only authenticated users of DevSync can trigger this external API call.
// Remove 'protect' if you want it to be fully public.
router.get("/:username", protect, getLeetCodeStats);

module.exports = router;

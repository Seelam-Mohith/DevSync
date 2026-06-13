const express = require("express");
const { getGitHubStats } = require("../controllers/githubController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:username", protect, getGitHubStats);

module.exports = router;

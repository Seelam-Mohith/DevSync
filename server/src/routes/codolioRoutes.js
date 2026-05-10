const express = require("express");
const { getCodolioStats, clearCodolioCache } = require("../controllers/codolioController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get Codolio stats for a username
router.get("/:username", getCodolioStats);

// Clear cache for a username (protected)
router.delete("/:username/cache", authMiddleware, clearCodolioCache);

// Clear all cache (protected)
router.delete("/cache/all", authMiddleware, clearCodolioCache);

module.exports = router;

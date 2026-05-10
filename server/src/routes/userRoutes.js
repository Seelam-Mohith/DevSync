const express = require("express");
const { getProfile, getUserStats, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/stats", protect, getUserStats);

module.exports = router;

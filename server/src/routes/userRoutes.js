const express = require("express");
const { getUserById, getProfile, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/:id", protect, getUserById);

module.exports = router;

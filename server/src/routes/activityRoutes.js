const express = require("express");
const { getMyActivities } = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyActivities);

module.exports = router;

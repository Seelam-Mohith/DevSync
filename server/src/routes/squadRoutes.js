const express = require("express");
const {
  createSquad,
  joinSquad,
  getSquad,
  getUserSquad,
  getSquadLeaderboard,
  leaveSquad,
  deleteSquad,
} = require("../controllers/squadController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createSquad);
router.post("/join", protect, joinSquad);
router.get("/my-squad", protect, getUserSquad);
router.get("/:id", protect, getSquad);
router.get("/:id/leaderboard", protect, getSquadLeaderboard);
router.post("/leave", protect, leaveSquad);
router.delete("/", protect, deleteSquad);

module.exports = router;

const Squad = require("../models/Squad");
const User = require("../models/User");

const createSquad = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    const existingSquad = await Squad.findOne({ leader: userId });
    if (existingSquad) {
      return res.status(400).json({ message: "You already own a squad" });
    }

    let inviteCode;
    let codeExists = true;
    while (codeExists) {
      inviteCode = Squad.generateInviteCode();
      codeExists = await Squad.findOne({ inviteCode });
    }

    let squad = await Squad.create({
      name,
      inviteCode,
      leader: userId,
      members: [userId],
    });

    await req.user.updateOne({ squad: squad._id });

    squad = await Squad.findById(squad._id)
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar");

    res.status(201).json({ squad });
  } catch (error) {
    next(error);
  }
};

const joinSquad = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user._id;

    let squad = await Squad.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!squad) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    if (squad.members.includes(userId)) {
      return res.status(400).json({ message: "You are already in this squad" });
    }

    squad.members.push(userId);
    await squad.save();

    await req.user.updateOne({ squad: squad._id });

    squad = await Squad.findById(squad._id)
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar");

    res.status(200).json({ squad });
  } catch (error) {
    next(error);
  }
};

const getSquad = async (req, res, next) => {
  try {
    const squad = await Squad.findById(req.params.id)
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar");

    if (!squad) {
      return res.status(404).json({ message: "Squad not found" });
    }

    res.status(200).json({ squad });
  } catch (error) {
    next(error);
  }
};

const getUserSquad = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const squad = await Squad.findOne({ members: userId })
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar");

    if (!squad) {
      return res.status(404).json({ message: "You are not in a squad" });
    }

    res.status(200).json({ squad });
  } catch (error) {
    next(error);
  }
};

const getMondayStr = (unixSeconds) => {
  const date = unixSeconds ? new Date(unixSeconds * 1000) : new Date();
  const day = date.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - diff));
  return monday.toISOString().split("T")[0];
};

const getCurrentMondayStr = () => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  return monday.toISOString().split("T")[0];
};

const computeActivity = (user, weekStartStr) => {
  const currentMonday = getCurrentMondayStr();
  if (weekStartStr === currentMonday) {
    if (user.weekSnapshotDate !== currentMonday) return 0;
    return Math.max(0, user.totalSolved - (user.totalSolvedAtWeekStart || 0));
  }
  const calendar = user.submissionCalendar;
  if (!calendar || typeof calendar !== "object") return 0;
  return Object.entries(calendar).reduce((sum, [dateStr, count]) => {
    return dateStr >= weekStartStr ? sum + count : sum;
  }, 0);
};

const getSquadLeaderboard = async (req, res, next) => {
  try {
    const squad = await Squad.findById(req.params.id);
    if (!squad) {
      return res.status(404).json({ message: "Squad not found" });
    }

    const weekStartUnix = req.query.weekStart ? Number(req.query.weekStart) : null;
    const weekStartStr = getMondayStr(weekStartUnix);

    const users = await User.find({ _id: { $in: squad.members } })
      .select("name email avatar submissionCalendar totalSolved totalSolvedAtWeekStart")
      .lean();

    const leaderboard = users
      .map((user) => {
        const totalActivity = computeActivity(user, weekStartStr);
        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          totalActivity,
          score: totalActivity * 5,
        };
      })
      .sort((a, b) => b.totalActivity - a.totalActivity);

    res.status(200).json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

const leaveSquad = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const squad = await Squad.findOne({ members: userId });
    if (!squad) {
      return res.status(404).json({ message: "You are not in a squad" });
    }

    if (squad.leader.toString() === userId.toString()) {
      return res.status(400).json({ message: "Leader cannot leave. Delete the squad instead." });
    }

    squad.members.pull(userId);
    await squad.save();

    await req.user.updateOne({ squad: null });

    res.status(200).json({ message: "Left squad successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteSquad = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const squad = await Squad.findOne({ leader: userId });
    if (!squad) {
      return res.status(404).json({ message: "Squad not found" });
    }

    await User.updateMany({ squad: squad._id }, { squad: null });
    await Squad.deleteOne({ _id: squad._id });

    res.status(200).json({ message: "Squad deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSquad,
  joinSquad,
  getSquad,
  getUserSquad,
  getSquadLeaderboard,
  leaveSquad,
  deleteSquad,
};

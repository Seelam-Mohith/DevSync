const Squad = require("../models/Squad");
const Score = require("../models/Score");
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

const getSquadLeaderboard = async (req, res, next) => {
  try {
    const squad = await Squad.findById(req.params.id);
    if (!squad) {
      return res.status(404).json({ message: "Squad not found" });
    }

    const leaderboard = await Score.aggregate([
      {
        $match: {
          user: { $in: squad.members },
        },
      },
      {
        $group: {
          _id: "$user",
          totalPoints: { $sum: "$points" },
          bestScore: { $max: "$points" },
          entries: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          avatar: "$user.avatar",
          totalPoints: 1,
          bestScore: 1,
          entries: 1,
        },
      },
    ]);

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

const Score = require("../models/Score");

const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await Score.aggregate([
      {
        $group: {
          _id: "$user",
          totalPoints: { $sum: "$points" },
          bestScore: { $max: "$points" },
          entries: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 25 },
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

module.exports = {
  getLeaderboard,
};

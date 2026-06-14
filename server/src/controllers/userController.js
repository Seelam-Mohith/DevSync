const Activity = require("../models/Activity");
const Score = require("../models/Score");

const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const [scoreSummary, recentActivities] = await Promise.all([
      Score.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: "$user",
            totalPoints: { $sum: "$points" },
            maxScore: { $max: "$points" },
            scoreEntries: { $sum: 1 },
          },
        },
      ]),
      Activity.find({ user: req.user._id }).sort({ date: -1 }).limit(7),
    ]);

    const activityStats = recentActivities.reduce(
      (acc, item) => {
        acc.commits += item.commits;
        acc.prs += item.prs;
        acc.reviews += item.reviews;
        acc.minutesFocused += item.minutesFocused;
        return acc;
      },
      { commits: 0, prs: 0, reviews: 0, minutesFocused: 0 }
    );

    const summary = scoreSummary[0] || {
      totalPoints: 0,
      maxScore: 0,
      scoreEntries: 0,
    };

    res.status(200).json({
      stats: {
        ...summary,
        ...activityStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { linkedAccounts, avatar } = req.body;
    
    // Find user and update
    const user = await req.user.constructor.findById(req.user._id);
    
    if (user) {
      if (linkedAccounts) {
        user.linkedAccounts = {
          ...user.linkedAccounts,
          ...linkedAccounts
        };
      }

      if (avatar) {
        user.avatar = avatar;
      }
      
      const updatedUser = await user.save();
      
      res.status(200).json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          linkedAccounts: updatedUser.linkedAccounts,
        }
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getUserStats,
  updateProfile,
};

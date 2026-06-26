const User = require("../models/User");

const getWeekStartStr = () => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  return monday.toISOString().split("T")[0];
};

const computeThisWeekSolved = (calendar) => {
  if (!calendar || typeof calendar !== "object") return 0;
  const weekStart = getWeekStartStr();
  return Object.entries(calendar).reduce((sum, [dateStr, count]) => {
    return dateStr >= weekStart ? sum + count : sum;
  }, 0);
};

const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("name email avatar submissionCalendar")
      .lean();

    const leaderboard = users
      .map((user) => {
        const totalActivity = computeThisWeekSolved(user.submissionCalendar);
        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          totalActivity,
          score: totalActivity * 5,
        };
      })
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .slice(0, 25);

    res.status(200).json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
};

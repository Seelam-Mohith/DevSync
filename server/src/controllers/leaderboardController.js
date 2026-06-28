const User = require("../models/User");

const getMondayStr = (unixSeconds) => {
  const date = unixSeconds ? new Date(unixSeconds * 1000) : new Date();
  const day = date.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - diff));
  return monday.toISOString().split("T")[0];
};

const getWeekEndStr = (mondayStr) => {
  const monday = new Date(mondayStr + "T00:00:00Z");
  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  return sunday.toISOString().split("T")[0];
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
    return Math.max(0, user.totalSolved - (user.totalSolvedAtWeekStart || 0));
  }
  const calendar = user.submissionCalendar;
  if (!calendar || typeof calendar !== "object") return 0;
  return Object.entries(calendar).reduce((sum, [dateStr, count]) => {
    return dateStr >= weekStartStr ? sum + count : sum;
  }, 0);
};

const getLeaderboard = async (req, res, next) => {
  try {
    const weekStartUnix = req.query.weekStart ? Number(req.query.weekStart) : null;
    const weekStartStr = getMondayStr(weekStartUnix);
    const weekEndStr = getWeekEndStr(weekStartStr);

    const users = await User.find()
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

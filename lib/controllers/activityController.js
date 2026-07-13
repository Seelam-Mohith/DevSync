const Activity = require("../models/Activity");

const getMyActivities = async (req, res) => {
  const activities = await Activity.find({ user: req.user._id }).sort({ date: 1 });

  return res.status(200).json({
    activities,
    isEmpty: activities.length === 0,
  });
};

module.exports = { getMyActivities };

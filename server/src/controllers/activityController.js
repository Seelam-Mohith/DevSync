const Activity = require("../models/Activity");

const getMyActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({ date: 1 });

    res.status(200).json({
      activities,
      isEmpty: activities.length === 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyActivities,
};

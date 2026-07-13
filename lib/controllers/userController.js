const User = require("../models/User");

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password").lean();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.submissionCalendar && typeof user.submissionCalendar === "object") {
    user.submissionCalendar = Object.fromEntries(
      new Map(Object.entries(user.submissionCalendar))
    );
  }

  return res.status(200).json({ user });
};

const getProfile = async (req, res) => {
  const user = req.user.toObject();

  if (user.submissionCalendar && typeof user.submissionCalendar === "object") {
    user.submissionCalendar = Object.fromEntries(
      new Map(Object.entries(user.submissionCalendar))
    );
  }

  return res.status(200).json({ user });
};

const updateProfile = async (req, res) => {
  const { leetcodeUsername, githubUsername, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (leetcodeUsername !== undefined) user.leetcodeUsername = leetcodeUsername;
  if (githubUsername !== undefined) user.githubUsername = githubUsername;
  if (avatar) user.avatar = avatar;

  const updatedUser = await user.save();

  return res.status(200).json({
    success: true,
    user: updatedUser.toObject(),
  });
};

module.exports = { getUserById, getProfile, updateProfile };

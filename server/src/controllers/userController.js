const getProfile = async (req, res, next) => {
  try {
    const user = req.user.toObject();

    // Convert Map to plain object for JSON response
    if (user.submissionCalendar && typeof user.submissionCalendar === "object") {
      user.submissionCalendar = Object.fromEntries(
        new Map(Object.entries(user.submissionCalendar))
      );
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { leetcodeUsername, githubUsername, avatar } = req.body;

    const user = await req.user.constructor.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (leetcodeUsername !== undefined) user.leetcodeUsername = leetcodeUsername;
    if (githubUsername !== undefined) user.githubUsername = githubUsername;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: updatedUser.toObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

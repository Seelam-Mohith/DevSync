const axios = require("axios");
const User = require("../models/User");

const GITHUB_API_BASE = "https://api.github.com";

const githubHeaders = {
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "DevSync-App",
};

const getGitHubStats = async (req, res) => {
  const { username } = req.params;

  if (!username || username.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "GitHub username is required",
    });
  }

  let profile;
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`, {
      headers: githubHeaders,
      timeout: 10000,
    });
    profile = response.data;
  } catch (error) {
    const status = error.response?.status || 500;
    if (status === 404) {
      return res.status(404).json({
        success: false,
        message: `GitHub user '${username}' not found`,
      });
    }
    throw error;
  }

  if (req.user) {
    const user = await User.findById(req.user._id);
    if (user) {
      user.githubUsername = username;
      user.totalRepositories = profile.public_repos ?? 0;
      user.githubName = profile.name || "";
      user.githubAvatarUrl = profile.avatar_url || "";
      user.githubProfileUrl = profile.html_url || "";
      user.githubBio = profile.bio || "";
      user.githubLastFetched = new Date();
      await user.save();
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      username: profile.login,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      profileUrl: profile.html_url,
      bio: profile.bio,
      joinedAt: profile.created_at,
      totalRepositories: profile.public_repos ?? 0,
    },
  });
};

module.exports = { getGitHubStats };

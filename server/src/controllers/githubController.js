const axios = require("axios");

const GITHUB_API_BASE = "https://api.github.com";

const githubHeaders = {
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "DevSync-App",
};

const fetchProfile = async (username) => {
  const response = await axios.get(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`, {
    headers: githubHeaders,
    timeout: 10000,
  });

  return response.data;
};

const getGitHubStats = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "GitHub username is required",
      });
    }

    const profile = await fetchProfile(username);

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
  } catch (error) {
    const status = error.response?.status || 500;

    if (status === 404) {
      return res.status(404).json({
        success: false,
        message: `GitHub user '${req.params.username}' not found`,
      });
    }

    console.error(`[GITHUB] Error fetching stats for ${req.params.username}:`, error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching GitHub stats",
      error: error.message,
    });
  }
};

module.exports = {
  getGitHubStats,
};

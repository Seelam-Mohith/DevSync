const axios = require("axios");

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

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

const fetchContributions = async (username) => {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      totalContributions: 0,
      available: false,
      source: "missing_token",
    };
  }

  const query = `
    query ($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  const response = await axios.post(
    GITHUB_GRAPHQL_URL,
    {
      query,
      variables: {
        login: username,
        from: "2008-01-01T00:00:00Z",
        to: new Date().toISOString(),
      },
    },
    {
      headers: {
        ...githubHeaders,
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    }
  );

  const totalContributions =
    response.data?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? 0;

  return {
    totalContributions,
    available: true,
    source: "graphql",
  };
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

    const contributionData = await fetchContributions(username).catch((error) => {
      console.warn("[GITHUB] Contribution fetch failed, falling back to zero:", error.message);
      return {
        totalContributions: 0,
        available: false,
        source: "error",
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        username: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        profileUrl: profile.html_url,
        bio: profile.bio,
        totalRepositories: profile.public_repos ?? 0,
        totalContributions: contributionData.totalContributions ?? 0,
        contributionsAvailable: contributionData.available,
        contributionSource: contributionData.source,
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

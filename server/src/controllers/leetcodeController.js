const axios = require("axios");
const User = require("../models/User");

const getLeetCodeStats = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          submissionCalendar
        }
      }
    `;

    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables: { username } },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      }
    );

    const data = response.data.data;

    if (!data.matchedUser) {
      return res.status(404).json({
        success: false,
        message: `LeetCode user '${username}' not found`,
      });
    }

    const stats = data.matchedUser.submitStats;

    const totalSolvedData = stats.acSubmissionNum.find((item) => item.difficulty === "All");
    const totalSubmissionsData = stats.totalSubmissionNum.find((item) => item.difficulty === "All");

    const totalSolved = totalSolvedData ? totalSolvedData.count : 0;
    const totalSubmissions = totalSubmissionsData ? totalSubmissionsData.submissions : 0;
    const acSubmissions = totalSolvedData ? totalSolvedData.submissions : 0;
    const acceptanceRate = totalSubmissions > 0 ? parseFloat(((acSubmissions / totalSubmissions) * 100).toFixed(2)) : 0;

    let currentStreak = 0;
    let totalActiveDays = 0;
    let mostActiveDay = 0;
    let submissionCalendar = {};

    if (data.matchedUser.submissionCalendar) {
      try {
        const calendar = JSON.parse(data.matchedUser.submissionCalendar);
        const timestamps = Object.keys(calendar).map(Number);

        submissionCalendar = Object.fromEntries(
          Object.entries(calendar).map(([ts, count]) => {
            const date = new Date(Number(ts) * 1000);
            const dateStr = date.toISOString().split("T")[0];
            return [dateStr, count];
          })
        );

        // Most active day
        const maxEntry = Object.entries(submissionCalendar).reduce((max, entry) =>
          Number(entry[1]) > Number(max[1]) ? entry : max
        , ["", 0]);
        mostActiveDay = Number(maxEntry[1]) || 0;

        if (timestamps.length > 0) {
          const now = Math.floor(Date.now() / 1000);
          const SECONDS_IN_DAY = 86400;
          const activeDays = new Set(timestamps.map(t => Math.floor(t / SECONDS_IN_DAY)));
          totalActiveDays = activeDays.size;

          let today = Math.floor(now / SECONDS_IN_DAY);
          if (activeDays.has(today)) {
            currentStreak = 1;
          } else if (activeDays.has(today - 1)) {
            currentStreak = 1;
            today = today - 1;
          }

          if (currentStreak > 0) {
            let checkDay = today - 1;
            while (activeDays.has(checkDay)) {
              currentStreak++;
              checkDay--;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing submissionCalendar", e);
      }
    }

    // Save stats to the requesting user's document
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.leetcodeUsername = username;
        user.totalSolved = totalSolved;
        user.totalSubmissions = totalSubmissions;
        user.acceptanceRate = acceptanceRate;
        user.currentStreak = currentStreak;
        user.totalActiveDays = totalActiveDays;
        user.mostActiveDay = mostActiveDay;
        user.easySolved = stats.acSubmissionNum.find((item) => item.difficulty === "Easy")?.count || 0;
        user.mediumSolved = stats.acSubmissionNum.find((item) => item.difficulty === "Medium")?.count || 0;
        user.hardSolved = stats.acSubmissionNum.find((item) => item.difficulty === "Hard")?.count || 0;
        user.submissionCalendar = submissionCalendar;
        user.leetcodeLastFetched = new Date();
        await user.save();
      }
    }

    const result = {
      username,
      totalSolved,
      totalSubmissions,
      acceptanceRate,
      currentStreak,
      totalActiveDays,
      mostActiveDay,
      submissionCalendar,
      difficultyBreakdown: {
        easy: stats.acSubmissionNum.find((item) => item.difficulty === "Easy")?.count || 0,
        medium: stats.acSubmissionNum.find((item) => item.difficulty === "Medium")?.count || 0,
        hard: stats.acSubmissionNum.find((item) => item.difficulty === "Hard")?.count || 0,
      },
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(`Error fetching LeetCode stats for ${req.params.username}:`, error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching LeetCode stats",
      error: error.message,
    });
  }
};

module.exports = {
  getLeetCodeStats,
};

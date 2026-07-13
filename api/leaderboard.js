const { apiHandler } = require("../lib/middleware/apiHandler");
const { getLeaderboard } = require("../lib/controllers/leaderboardController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["GET"],
    auth: true,
    handler: getLeaderboard,
  });
};

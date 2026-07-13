const { apiHandler } = require("../../../lib/middleware/apiHandler");
const { getSquadLeaderboard } = require("../../../lib/controllers/squadController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["GET"],
    auth: true,
    handler: getSquadLeaderboard,
  });
};

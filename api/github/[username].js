const { apiHandler } = require("../../lib/middleware/apiHandler");
const { getGitHubStats } = require("../../lib/controllers/githubController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["GET"],
    auth: true,
    handler: getGitHubStats,
  });
};

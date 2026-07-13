const { apiHandler } = require("../../lib/middleware/apiHandler");
const { getLeetCodeStats } = require("../../lib/controllers/leetcodeController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["GET"],
    auth: true,
    handler: getLeetCodeStats,
  });
};

const { apiHandler } = require("../lib/middleware/apiHandler");
const { getMyActivities } = require("../lib/controllers/activityController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["GET"],
    auth: true,
    handler: getMyActivities,
  });
};

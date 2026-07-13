const { apiHandler } = require("../../lib/middleware/apiHandler");
const { getUserSquad } = require("../../lib/controllers/squadController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["GET"],
    auth: true,
    handler: getUserSquad,
  });
};

const { apiHandler } = require("../../lib/middleware/apiHandler");
const { joinSquad } = require("../../lib/controllers/squadController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["POST"],
    auth: true,
    handler: joinSquad,
  });
};

const { apiHandler } = require("../../lib/middleware/apiHandler");
const { getUserById } = require("../../lib/controllers/userController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["GET"],
    auth: true,
    handler: getUserById,
  });
};

const { apiHandler } = require("../../lib/middleware/apiHandler");
const { login } = require("../../lib/controllers/authController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["POST"],
    auth: false,
    handler: login,
  });
};

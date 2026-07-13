const { apiHandler } = require("../../lib/middleware/apiHandler");
const { getProfile, updateProfile } = require("../../lib/controllers/userController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["GET", "PUT"],
    auth: true,
    handler: async (req, res) => {
      if (req.method === "GET") return getProfile(req, res);
      if (req.method === "PUT") return updateProfile(req, res);
    },
  });
};

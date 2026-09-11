const { apiHandler } = require("../../lib/middleware/apiHandler");
const { updateOnboardingPreference } = require("../../lib/controllers/userController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["PATCH"],
    auth: true,
    handler: async (req, res) => {
      if (req.method === "PATCH") return updateOnboardingPreference(req, res);
    },
  });
};

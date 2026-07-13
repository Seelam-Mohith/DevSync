const { apiHandler } = require("../../lib/middleware/apiHandler");
const { createSquad, deleteSquad } = require("../../lib/controllers/squadController");

module.exports = async function handler(req, res) {
  return apiHandler(req, res, {
    methods: ["POST", "DELETE"],
    auth: true,
    handler: async (req, res) => {
      if (req.method === "POST") return createSquad(req, res);
      if (req.method === "DELETE") return deleteSquad(req, res);
    },
  });
};

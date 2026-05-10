const dotenv = require("dotenv");
const path = require("path");
const app = require("./app");
const connectDB = require("./config/db");
const seedTestUser = require("./config/seed");

// Load environment variables early
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error("[SERVER] ✗ Missing required environment variables:", missingEnvVars);
  console.error("[SERVER] Please check your .env file");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

console.log("\n" + "=".repeat(60));
console.log("[SERVER] Starting DevSync Server");
console.log("=".repeat(60));
console.log("[SERVER] Configuration:");
console.log(`  - Host: ${HOST}`);
console.log(`  - Port: ${PORT}`);
console.log(`  - Environment: ${NODE_ENV}`);
console.log(`  - Client URL (CORS): ${CLIENT_URL}`);
console.log(`  - JWT Secret: ${process.env.JWT_SECRET ? "✓ Configured" : "✗ Missing"}`);
console.log("=".repeat(60) + "\n");

const startServer = async () => {
  try {
    // Connect to database
    console.log("[SERVER] Connecting to database...");
    await connectDB();
    console.log("[SERVER] ✓ Database connected\n");
    // Seed test user
    console.log("[SERVER] Seeding test user...");
    await seedTestUser();
    console.log("[SERVER] ✓ Test user ready\\n");
    // Start listening
    app.listen(PORT, HOST, () => {
      console.log("[SERVER] ✓ Server started successfully!");
      console.log(`[SERVER] → API running at http://localhost:${PORT}`);
      console.log(`[SERVER] → Frontend should connect to: http://localhost:${PORT}/api`);
      console.log(`[SERVER] → Health check: curl http://localhost:${PORT}/api/health`);
      console.log(`[SERVER] → Test login: curl -X POST http://localhost:${PORT}/api/auth/login`);
      console.log("\n[SERVER] Ready for incoming connections...\n");
    });
  } catch (error) {
    console.error("\n[SERVER] ✗ Failed to start server:");
    console.error(`[SERVER]   Error: ${error.message}`);
    if (error.stack) {
      console.error(`[SERVER]   Stack: ${error.stack}`);
    }
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[SERVER] Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[SERVER] Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

startServer();

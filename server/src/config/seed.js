const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedTestUser = async () => {
  try {
    // Check if test user exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      console.log("[SEED] Test user already exists");
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create test user
    const testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
    });

    console.log("[SEED] ✓ Test user created");
    console.log("[SEED]   Email: test@example.com");
    console.log("[SEED]   Password: password123");

    return testUser;
  } catch (error) {
    console.error("[SEED] Error seeding test user:", error.message);
  }
};

module.exports = seedTestUser;

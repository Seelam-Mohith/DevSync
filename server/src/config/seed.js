const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Score = require("../models/Score");
const Activity = require("../models/Activity");

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

    // Create starter data
    const now = new Date();
    const scores = [120, 155, 90].map((points, index) => ({
      user: testUser._id,
      points,
      date: new Date(now.getTime() - index * 24 * 60 * 60 * 1000),
    }));

    const activities = Array.from({ length: 14 }).map((_, index) => {
      const date = new Date(now.getTime() - index * 24 * 60 * 60 * 1000);
      const commits = (index * 3) % 7;
      const prs = index % 3;
      const reviews = (index + 1) % 4;
      const minutesFocused = 20 + (index % 5) * 15;

      return {
        user: testUser._id,
        date,
        commits,
        prs,
        reviews,
        minutesFocused,
      };
    });

    await Score.insertMany(scores);
    await Activity.insertMany(activities);

    console.log("[SEED] ✓ Starter data created");

    return testUser;
  } catch (error) {
    console.error("[SEED] Error seeding test user:", error.message);
  }
};

module.exports = seedTestUser;

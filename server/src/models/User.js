const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "Aria",
    },

    // Linked account usernames
    leetcodeUsername: { type: String, default: "" },
    githubUsername: { type: String, default: "" },

    // LeetCode stats (defaults to 0 until fetched)
    totalSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    totalActiveDays: { type: Number, default: 0 },
    mostActiveDay: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    submissionCalendar: { type: Map, of: Number, default: {} },

    // GitHub stats (defaults to 0 until fetched)
    totalRepositories: { type: Number, default: 0 },
    githubName: { type: String, default: "" },
    githubAvatarUrl: { type: String, default: "" },
    githubProfileUrl: { type: String, default: "" },
    githubBio: { type: String, default: "" },

    // Last fetch timestamps
    leetcodeLastFetched: { type: Date, default: null },
    githubLastFetched: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

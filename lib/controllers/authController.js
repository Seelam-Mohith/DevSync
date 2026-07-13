const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const register = async (req, res) => {
  const { name, email, password, avatar } = req.body;

  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required");
    error.status = 400;
    throw error;
  }

  if (!validateEmail(email)) {
    const error = new Error("Invalid email format");
    error.status = 400;
    throw error;
  }

  if (!validatePassword(password)) {
    const error = new Error("Password must be at least 6 characters long");
    error.status = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email is already in use");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    avatar: avatar || "Aria",
  });

  const token = generateToken(user._id);

  return res.status(201).json({
    success: true,
    message: "Account created successfully",
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      leetcodeUsername: user.leetcodeUsername,
      githubUsername: user.githubUsername,
      totalSolved: user.totalSolved,
      totalSubmissions: user.totalSubmissions,
      acceptanceRate: user.acceptanceRate,
      currentStreak: user.currentStreak,
      totalActiveDays: user.totalActiveDays,
      mostActiveDay: user.mostActiveDay,
      easySolved: user.easySolved,
      mediumSolved: user.mediumSolved,
      hardSolved: user.hardSolved,
      submissionCalendar: Object.fromEntries(user.submissionCalendar || {}),
      totalRepositories: user.totalRepositories,
      githubName: user.githubName,
      githubAvatarUrl: user.githubAvatarUrl,
      githubProfileUrl: user.githubProfileUrl,
      githubBio: user.githubBio,
    },
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({
    $or: [{ email }, { username: email }],
  });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      leetcodeUsername: user.leetcodeUsername,
      githubUsername: user.githubUsername,
      totalSolved: user.totalSolved,
      totalSubmissions: user.totalSubmissions,
      acceptanceRate: user.acceptanceRate,
      currentStreak: user.currentStreak,
      totalActiveDays: user.totalActiveDays,
      mostActiveDay: user.mostActiveDay,
      easySolved: user.easySolved,
      mediumSolved: user.mediumSolved,
      hardSolved: user.hardSolved,
      submissionCalendar: Object.fromEntries(user.submissionCalendar || {}),
      totalRepositories: user.totalRepositories,
      githubName: user.githubName,
      githubAvatarUrl: user.githubAvatarUrl,
      githubProfileUrl: user.githubProfileUrl,
      githubBio: user.githubBio,
    },
    token,
  });
};

module.exports = { register, login, validateEmail, validatePassword };

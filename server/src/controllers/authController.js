const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Score = require("../models/Score");
const Activity = require("../models/Activity");
const generateToken = require("../utils/generateToken");

const createStarterData = async (userId) => {
  const now = new Date();
  const scores = [120, 155, 90].map((points, index) => ({
    user: userId,
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
      user: userId,
      date,
      commits,
      prs,
      reviews,
      minutesFocused,
    };
  });

  await Score.insertMany(scores);
  await Activity.insertMany(activities);
};

// Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const validatePassword = (password) => {
  return password && password.length >= 6;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    console.log("[AUTH] Register attempt:", { name, email, passwordLength: password?.length });

    // Validation
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

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("[AUTH] Registration failed: Email already exists", { email });
      const error = new Error("Email is already in use");
      error.status = 409;
      throw error;
    }

    // Hash password
    console.log("[AUTH] Hashing password");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log("[AUTH] User created:", { userId: user._id, email });

    // Create starter data
    await createStarterData(user._id);
    console.log("[AUTH] Starter data created for user", { userId: user._id });

    // Generate token
    const token = generateToken(user._id);
    console.log("[AUTH] Token generated successfully");

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("[AUTH] Registration error:", {
      message: error.message,
      status: error.status || 500,
    });
    error.status = error.status || 500;
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log("[AUTH] Login attempt:", { email, passwordLength: password?.length });

    // Validation
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      throw error;
    }

    if (!validateEmail(email)) {
      const error = new Error("Invalid email format");
      error.status = 400;
      throw error;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[AUTH] Login failed: User not found", { email });
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }
    console.log("[AUTH] User found", { userId: user._id });

    // Compare passwords
    console.log("[AUTH] Comparing passwords");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("[AUTH] Login failed: Password mismatch", { email });
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }
    console.log("[AUTH] Password verified");

    // Generate token
    const token = generateToken(user._id);
    console.log("[AUTH] Login successful, token generated", { userId: user._id });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("[AUTH] Login error:", {
      message: error.message,
      status: error.status || 500,
    });
    error.status = error.status || 500;
    next(error);
  }
};

module.exports = {
  register,
  login,
  validateEmail,
  validatePassword,
};

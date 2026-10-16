const bcrypt = require("bcryptjs");
const axios = require("axios");
const crypto = require("crypto");
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

  if (!user.password) {
    const error = new Error("This account uses GitHub OAuth. Please sign in with GitHub.");
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

const getClientUrl = () => process.env.CLIENT_URL || "http://localhost:5173";

const getRedirectUri = (req) => {
  if (process.env.GITHUB_CALLBACK_URL) return process.env.GITHUB_CALLBACK_URL;
  const proto = req.headers?.["x-forwarded-proto"] || "https";
  const host = req.headers?.host || "localhost:5000";
  return `${proto}://${host}/api/auth/github/callback`;
};

const githubAuth = (req, res) => {
  const { GITHUB_CLIENT_ID } = process.env;

  if (!GITHUB_CLIENT_ID) {
    return res.redirect(`${getClientUrl()}/login?error=GitHub OAuth not configured`);
  }

  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("gh_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: "read:user user:email",
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};

const githubCallback = async (req, res) => {
  const { code, state } = req.query;
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
  const clientUrl = getClientUrl();

  const cookieHeader = req.headers?.cookie || "";
  const storedState = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("gh_oauth_state="));
  const savedState = storedState ? decodeURIComponent(storedState.split("=")[1]) : null;
  res.clearCookie("gh_oauth_state");

  if (!state || !savedState || state !== savedState) {
    return res.redirect(`${clientUrl}/login?error=Invalid or missing OAuth state`);
  }

  if (!code) {
    return res.redirect(`${clientUrl}/login?error=No authorization code received`);
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.redirect(`${clientUrl}/login?error=GitHub OAuth not configured`);
  }

  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: "application/json" }, timeout: 10000 }
  );

  const accessToken = tokenResponse.data.access_token;
  if (!accessToken) {
    return res.redirect(`${clientUrl}/login?error=Failed to authenticate with GitHub`);
  }

  const profileResponse = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 10000,
  });

  const { id: githubId, login, name: githubName, avatar_url } = profileResponse.data;

  const emailsResponse = await axios.get("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 10000,
  });

  const primaryEmail = emailsResponse.data.find((e) => e.primary && e.verified);
  const email = primaryEmail ? primaryEmail.email : null;

  if (!email) {
    return res.redirect(
      `${clientUrl}/login?error=No verified primary email found on GitHub`
    );
  }

  let user = await User.findOne({ email });

  if (user) {
    if (user.provider === "local" && !user.githubId) {
      user.githubId = String(githubId);
      if (!user.githubUsername) {
        user.githubUsername = login;
      }
      await user.save();
    }
  } else {
    const displayName = githubName || login;
    let username = login;
    let counter = 1;
    while (await User.findOne({ username })) {
      username = `${login}_${counter}`;
      counter++;
    }

    user = await User.create({
      name: displayName,
      email,
      avatar: avatar_url,
      githubId: String(githubId),
      githubUsername: login,
      githubName: displayName,
      githubAvatarUrl: avatar_url,
      githubProfileUrl: `https://github.com/${login}`,
      username,
      provider: "github",
      password: undefined,
    });
  }

  const token = generateToken(user._id);
  res.redirect(`${clientUrl}/github-callback?token=${token}`);
};

module.exports = {
  register,
  login,
  githubAuth,
  githubCallback,
  validateEmail,
  validatePassword,
};

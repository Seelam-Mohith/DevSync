const bcrypt = require("bcryptjs");
const axios = require("axios");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    console.log("[AUTH] Register attempt:", { name, email, avatar, passwordLength: password?.length });

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
      console.log("[AUTH] Registration failed: Email already exists", { email });
      const error = new Error("Email is already in use");
      error.status = 409;
      throw error;
    }

    console.log("[AUTH] Hashing password");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatar || "Aria",
    });
    console.log("[AUTH] User created:", { userId: user._id, email });

    const token = generateToken(user._id);
    console.log("[AUTH] Token generated successfully");

    res.status(201).json({
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

    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      throw error;
    }

    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    if (!user) {
      console.log("[AUTH] Login failed: User not found", { email });
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }
    console.log("[AUTH] User found", { userId: user._id });

    if (!user.password) {
      console.log("[AUTH] Login failed: Account uses GitHub OAuth", { email });
      const error = new Error("This account uses GitHub OAuth. Please sign in with GitHub.");
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("[AUTH] Login failed: Password mismatch", { email });
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }
    console.log("[AUTH] Password verified");

    const token = generateToken(user._id);
    console.log("[AUTH] Login successful, token generated", { userId: user._id });

    res.status(200).json({
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
  } catch (error) {
    console.error("[AUTH] Login error:", {
      message: error.message,
      status: error.status || 500,
    });
    error.status = error.status || 500;
    next(error);
  }
};

const getRedirectUri = (req) => {
  if (process.env.GITHUB_CALLBACK_URL) return process.env.GITHUB_CALLBACK_URL;
  return `${req.protocol}://${req.get("host")}/api/auth/github/callback`;
};

const githubAuth = (req, res) => {
  const { GITHUB_CLIENT_ID } = process.env;

  if (!GITHUB_CLIENT_ID) {
    console.error("[GITHUB_OAUTH] GITHUB_CLIENT_ID not configured");
    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=GitHub OAuth not configured`);
  }

  const redirectUri = getRedirectUri(req);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
  });

  const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
  console.log("[GITHUB_OAUTH] Redirecting to GitHub:", url);
  res.redirect(url);
};

const githubCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    const {
      GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET,
      CLIENT_URL,
    } = process.env;

    const clientUrl = CLIENT_URL || "http://localhost:5173";
    const redirectUri = getRedirectUri(req);

    if (!code) {
      return res.redirect(`${clientUrl}/login?error=No authorization code received`);
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      console.error("[GITHUB_OAUTH] GitHub OAuth not configured");
      return res.redirect(`${clientUrl}/login?error=GitHub OAuth not configured`);
    }

    // Exchange code for access token
    console.log("[GITHUB_OAUTH] Exchanging code for access token");
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: { Accept: "application/json" },
        timeout: 10000,
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error("[GITHUB_OAUTH] Failed to get access token:", tokenResponse.data);
      return res.redirect(`${clientUrl}/login?error=Failed to authenticate with GitHub`);
    }

    console.log("[GITHUB_OAUTH] Access token received");

    // Fetch GitHub user profile
    console.log("[GITHUB_OAUTH] Fetching user profile");
    const profileResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });

    const { id: githubId, login, name: githubName, avatar_url } = profileResponse.data;
    console.log("[GITHUB_OAUTH] Profile fetched:", { githubId, login });

    // Fetch primary verified email
    console.log("[GITHUB_OAUTH] Fetching emails");
    const emailsResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });

    const primaryEmail = emailsResponse.data.find(
      (e) => e.primary && e.verified
    );
    const email = primaryEmail ? primaryEmail.email : null;

    if (!email) {
      console.error("[GITHUB_OAUTH] No verified primary email found");
      return res.redirect(
        `${clientUrl}/login?error=No verified primary email found on GitHub. Make sure your email is verified.`
      );
    }

    // Check if user with this email already exists
    let user = await User.findOne({ email });

    if (user) {
      // Existing user — link GitHub if not already linked
      console.log("[GITHUB_OAUTH] Existing user found:", { userId: user._id });

      if (user.provider === "local" && !user.githubId) {
        user.githubId = String(githubId);
        user.provider = "local"; // keep as local since they registered with email/password
        if (!user.githubUsername) {
          user.githubUsername = login;
        }
        await user.save();
        console.log("[GITHUB_OAUTH] GitHub account linked to existing user");
      } else if (user.githubId && user.githubId !== String(githubId)) {
        console.warn("[GITHUB_OAUTH] GitHub ID mismatch for existing user");
      }
    } else {
      // New user — create with GitHub data
      console.log("[GITHUB_OAUTH] Creating new user from GitHub data");

      const displayName = githubName || login;

      // Generate a unique username from GitHub login
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
      console.log("[GITHUB_OAUTH] New user created:", { userId: user._id });
    }

    const token = generateToken(user._id);
    console.log("[GITHUB_OAUTH] Token generated, redirecting to frontend");

    // Redirect to frontend with token
    res.redirect(`${clientUrl}/github-callback?token=${token}`);
  } catch (error) {
    console.error("[GITHUB_OAUTH] Callback error:", error.message);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/login?error=GitHub authentication failed`);
  }
};

module.exports = {
  register,
  login,
  githubAuth,
  githubCallback,
  validateEmail,
  validatePassword,
};

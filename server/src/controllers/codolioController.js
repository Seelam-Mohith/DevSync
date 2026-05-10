const axios = require("axios");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");

// Initialize cache with 1-hour TTL (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const parseCodolioProfile = async (username) => {
  try {
    // Attempt to fetch from Codolio API first (if available)
    try {
      const apiResponse = await axios.get(`https://codolio.com/api/profile/${username}`, {
        timeout: 5000,
        headers: {
          "User-Agent": "DevSync/1.0",
        },
      });

      if (apiResponse.data) {
        return {
          success: true,
          data: apiResponse.data,
          source: "api",
        };
      }
    } catch (apiError) {
      console.log(`Codolio API not available for ${username}, attempting web scraping...`);
    }

    // Fallback: Web scraping
    const profileUrl = `https://codolio.com/profile/${username}`;
    const response = await axios.get(profileUrl, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const profileData = {};

    // Extract profile information
    profileData.username = username;
    profileData.totalActiveDays = parseInt(
      $('[data-testid="total-active-days"]')?.text()?.replace(/\D/g, "") || "0"
    );
    profileData.currentStreak = parseInt(
      $('[data-testid="current-streak"]')?.text()?.replace(/\D/g, "") || "0"
    );
    profileData.longestStreak = parseInt(
      $('[data-testid="longest-streak"]')?.text()?.replace(/\D/g, "") || "0"
    );
    profileData.totalSubmissions = parseInt(
      $('[data-testid="total-submissions"]')?.text()?.replace(/\D/g, "") || "0"
    );

    // Extract acceptance rate
    const acceptanceRateText = $('[data-testid="acceptance-rate"]')?.text();
    profileData.acceptanceRate = parseInt(acceptanceRateText?.replace(/\D/g, "") || "0");

    // Extract most used platform
    const platformElements = $('[data-testid="platform"]');
    if (platformElements.length > 0) {
      profileData.mostUsedPlatform = platformElements.first().text().trim() || "LeetCode";
    } else {
      profileData.mostUsedPlatform = "LeetCode";
    }

    // Extract most active day (if available)
    const dayElements = $('[data-testid="most-active-day"]');
    if (dayElements.length > 0) {
      const dayName = dayElements.first().text().trim();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      profileData.mostActiveDayIndex = days.indexOf(dayName.substring(0, 3)) || 0;
    } else {
      profileData.mostActiveDayIndex = new Date().getDay();
    }

    return {
      success: true,
      data: profileData,
      source: "scrape",
    };
  } catch (error) {
    console.error(`Error fetching Codolio profile for ${username}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

const getCodolioStats = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    // Check cache first
    const cacheKey = `codolio_${username}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
    }

    // Fetch fresh data
    const result = await parseCodolioProfile(username);

    if (result.success) {
      // Cache the result
      cache.set(cacheKey, result.data);

      return res.status(200).json({
        success: true,
        data: result.data,
        cached: false,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch Codolio profile: ${result.error}`,
      });
    }
  } catch (error) {
    console.error("Error in getCodolioStats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching Codolio stats",
    });
  }
};

const clearCodolioCache = (req, res) => {
  try {
    const { username } = req.params;

    if (username) {
      cache.del(`codolio_${username}`);
      return res.status(200).json({
        success: true,
        message: `Cache cleared for user ${username}`,
      });
    }

    // Clear all cache
    cache.flushAll();
    res.status(200).json({
      success: true,
      message: "All cache cleared",
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cache",
    });
  }
};

module.exports = {
  getCodolioStats,
  clearCodolioCache,
};

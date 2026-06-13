import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import UserCard from "../components/UserCard";
import StatsCards from "../components/StatsCards";
import CodingProfileMetrics from "../components/CodingProfileMetrics";
import api from "../lib/api";
import useAuth from "../hooks/useAuth";
import useGitHubStats from "../hooks/useGitHubStats";
import useCodolioStats from "../hooks/useCodolioStats";
import useLeetCodeStats from "../hooks/useLeetCodeStats";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("devsync_theme") === "dark");
  const [codolioUsername, setCodolioUsername] = useState(localStorage.getItem("codolio_username") || "");
  const githubUsername = user?.linkedAccounts?.github;

  // Fetch Codolio stats
  const {
    stats: codolioStats,
    loading: codolioLoading,
    error: codolioError,
  } = useCodolioStats(codolioUsername, {
    autoFetch: !!codolioUsername,
    refetchInterval: 60000, // Refetch every 1 minute
  });

  // Fetch LeetCode stats
  const leetcodeUsername = user?.linkedAccounts?.leetcode;
  const {
    stats: leetcodeStats,
    loading: leetcodeLoading,
    error: leetcodeError,
  } = useLeetCodeStats(leetcodeUsername, {
    autoFetch: !!leetcodeUsername,
  });

  const {
    stats: githubStats,
    loading: githubLoading,
    error: githubError,
  } = useGitHubStats(githubUsername, {
    autoFetch: !!githubUsername,
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("devsync_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const loadDashboard = async () => {
      setError("");
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get("/user/stats"),
          api.get("/activity"),
        ]);
        setStats(statsRes.data.stats);
        setActivities(activityRes.data.activities || []);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load dashboard");
      }
    };

    loadDashboard();
  }, []);

  // Merge Codolio and LeetCode stats with existing stats
  const mergedStats = {
    ...stats,
    ...(codolioStats && {
      totalActiveDays: codolioStats.totalActiveDays,
      currentStreak: codolioStats.currentStreak,
      acceptanceRate: codolioStats.acceptanceRate,
      mostUsedPlatform: codolioStats.mostUsedPlatform,
      mostActiveDayIndex: codolioStats.mostActiveDayIndex,
    }),
    ...(leetcodeStats && {
      totalSolved: leetcodeStats.totalSolved,
      totalSubmissions: leetcodeStats.totalSubmissions,
      ...(leetcodeStats.acceptanceRate > 0 && { acceptanceRate: leetcodeStats.acceptanceRate }),
      ...(leetcodeStats.currentStreak > 0 && { currentStreak: leetcodeStats.currentStreak }),
      ...(leetcodeStats.totalActiveDays > 0 && { totalActiveDays: leetcodeStats.totalActiveDays }),
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-500/5 backdrop-blur p-4 text-sm text-red-400">
              {error}
            </div>
          )}
          {codolioError && (
            <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 backdrop-blur p-4 text-sm text-yellow-400">
              Could not fetch Codolio stats. Error: {codolioError}
            </div>
          )}
          {leetcodeError && (
            <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 backdrop-blur p-4 text-sm text-yellow-400">
              Could not fetch LeetCode stats. Error: {leetcodeError}
            </div>
          )}
          {githubError && (
            <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 backdrop-blur p-4 text-sm text-yellow-400">
              Could not fetch GitHub stats. Error: {githubError}
            </div>
          )}
          {codolioLoading && codolioUsername && (
            <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-500/5 backdrop-blur p-4 text-sm text-blue-400">
              Fetching Codolio profile data for {codolioUsername}...
            </div>
          )}
          {leetcodeLoading && leetcodeUsername && (
            <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-500/5 backdrop-blur p-4 text-sm text-blue-400 mt-2">
              Fetching LeetCode profile data for {leetcodeUsername}...
            </div>
          )}
          {githubLoading && githubUsername && (
            <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-500/5 backdrop-blur p-4 text-sm text-blue-400 mt-2">
              Fetching GitHub profile data for {githubUsername}...
            </div>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <UserCard user={user} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatsCards stats={mergedStats} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CodingProfileMetrics
              activities={activities}
              githubStats={githubStats}
              githubUsername={githubUsername}
            />
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default DashboardPage;

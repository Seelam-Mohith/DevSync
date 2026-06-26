import { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import UserCard from "../components/UserCard";
import StatsCards from "../components/StatsCards";
import CodingProfileMetrics from "../components/CodingProfileMetrics";
import useAuth from "../hooks/useAuth";
import useGitHubStats from "../hooks/useGitHubStats";
import useLeetCodeStats from "../hooks/useLeetCodeStats";

const DashboardPage = () => {
  const { user } = useAuth();

  const leetcodeUsername = user?.leetcodeUsername;
  const githubUsername = user?.githubUsername;

  const {
    stats: leetcodeStats,
    loading: leetcodeLoading,
    error: leetcodeError,
    refetch: refetchLeetCode,
  } = useLeetCodeStats(leetcodeUsername, {
    autoFetch: false,
  });

  const {
    stats: githubStats,
    loading: githubLoading,
    error: githubError,
    refetch: refetchGitHub,
  } = useGitHubStats(githubUsername, {
    autoFetch: false,
  });

  useEffect(() => {
    if (leetcodeUsername) refetchLeetCode();
  }, [leetcodeUsername]);

  useEffect(() => {
    if (githubUsername) refetchGitHub();
  }, [githubUsername]);

  // Submission calendar for the heatmap (from fetched leetcode stats or user profile)
  const submissionCalendar =
    leetcodeStats?.submissionCalendar || user?.submissionCalendar || {};

  // Build stats object from user profile + fetched stats
  const getThisWeekSolved = (calendar) => {
    if (!calendar || typeof calendar !== "object") return 0;
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
    const weekStart = monday.toISOString().split("T")[0];
    return Object.entries(calendar).reduce((sum, [dateStr, count]) => {
      return dateStr >= weekStart ? sum + count : sum;
    }, 0);
  };

  const displayStats = {
    totalSolved: leetcodeStats?.totalSolved ?? user?.totalSolved ?? 0,
    totalSubmissions: leetcodeStats?.totalSubmissions ?? user?.totalSubmissions ?? 0,
    acceptanceRate: leetcodeStats?.acceptanceRate ?? user?.acceptanceRate ?? 0,
    currentStreak: leetcodeStats?.currentStreak ?? user?.currentStreak ?? 0,
    totalActiveDays: leetcodeStats?.totalActiveDays ?? user?.totalActiveDays ?? 0,
    thisWeekSolved: getThisWeekSolved(submissionCalendar),
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
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
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
          {leetcodeLoading && leetcodeUsername && (
            <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-500/5 backdrop-blur p-4 text-sm text-blue-400">
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
            <StatsCards stats={displayStats} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CodingProfileMetrics
              submissionCalendar={submissionCalendar}
              githubStats={githubStats}
              githubUsername={githubUsername}
              leetcodeUsername={leetcodeUsername}
            />
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default DashboardPage;

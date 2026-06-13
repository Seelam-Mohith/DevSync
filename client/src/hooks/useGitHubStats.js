import { useEffect, useState } from "react";
import api from "../lib/api";

const useGitHubStats = (username, options = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { autoFetch = true } = options;

  const fetchStats = async () => {
    if (!username) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/github/${username}`);

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch GitHub stats");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch GitHub stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && username) {
      fetchStats();
    }
  }, [username, autoFetch]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export default useGitHubStats;

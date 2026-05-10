import { useState, useEffect } from "react";
import api from "../lib/api";

const useCodolioStats = (username, options = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cached, setCached] = useState(false);

  const { autoFetch = true, refetchInterval = null } = options;

  const fetchStats = async (usernameParam = username) => {
    if (!usernameParam) {
      setError("Username is required");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/codolio/${usernameParam}`);

      if (response.data.success) {
        setStats(response.data.data);
        setCached(response.data.cached || false);
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch Codolio stats");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch Codolio stats";
      setError(errorMessage);
      console.error("Error fetching Codolio stats:", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (usernameParam = username) => {
    try {
      await api.delete(`/codolio/${usernameParam}/cache`);
      // Refetch data after clearing cache
      return fetchStats(usernameParam);
    } catch (err) {
      console.error("Error clearing cache:", err);
      return null;
    }
  };

  const retry = () => {
    fetchStats();
  };

  useEffect(() => {
    if (autoFetch && username) {
      fetchStats();
    }
  }, [username, autoFetch]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (!refetchInterval || !username) return;

    const interval = setInterval(() => {
      fetchStats();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [username, refetchInterval]);

  return {
    stats,
    loading,
    error,
    cached,
    fetchStats,
    clearCache,
    retry,
  };
};

export default useCodolioStats;

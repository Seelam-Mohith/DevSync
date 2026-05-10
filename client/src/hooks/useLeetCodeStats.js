import { useState, useEffect } from "react";
import api from "../lib/api";

const useLeetCodeStats = (username, options = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { autoFetch = true, refetchInterval = 0 } = options;

  const fetchStats = async (force = false) => {
    if (!username) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/leetcode/${username}`);
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch LeetCode stats");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "An error occurred while fetching LeetCode data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && username) {
      fetchStats();
    }
  }, [username, autoFetch]);

  useEffect(() => {
    let intervalId;
    if (refetchInterval > 0 && username) {
      intervalId = setInterval(() => {
        fetchStats(true);
      }, refetchInterval);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [username, refetchInterval]);

  return { stats, loading, error, refetch: () => fetchStats(true) };
};

export default useLeetCodeStats;

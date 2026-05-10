import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import LeaderboardTable from "../components/LeaderboardTable";
import api from "../lib/api";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("devsync_theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("devsync_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setError("");
      try {
        const { data } = await api.get("/leaderboard");
        setLeaderboard(data.leaderboard || []);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load leaderboard");
      }
    };

    loadLeaderboard();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {error && <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <LeaderboardTable entries={leaderboard} />
      </main>
    </div>
  );
};

export default LeaderboardPage;

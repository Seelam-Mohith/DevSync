import { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar";
import LeaderboardTable from "../components/LeaderboardTable";
import SquadPanel from "../components/SquadPanel";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, Users, Globe, Calendar } from "lucide-react";
import api from "../lib/api";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [squadLeaderboard, setSquadLeaderboard] = useState([]);
  const [squad, setSquad] = useState(null);
  const [view, setView] = useState("global");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("devsync_theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("devsync_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const weekRange = useMemo(() => {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
    const sunday = new Date(monday);
    sunday.setUTCDate(sunday.getUTCDate() + 6);
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    return `${fmt(monday)} - ${fmt(sunday)}, ${monday.getUTCFullYear()}`;
  }, []);

  const loadGlobal = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get("/leaderboard");
      setLeaderboard(data.leaderboard || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load leaderboard");
    }
  }, []);

  const loadSquadLeaderboard = useCallback(async (squadId) => {
    if (!squadId) return;
    setError("");
    try {
      const { data } = await api.get(`/squads/${squadId}/leaderboard`);
      setSquadLeaderboard(data.leaderboard || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load squad leaderboard");
    }
  }, []);

  const loadUserSquad = useCallback(async () => {
    try {
      const { data } = await api.get("/squads/my-squad");
      setSquad(data.squad);
      return data.squad;
    } catch {
      setSquad(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadGlobal();
      const userSquad = await loadUserSquad();
      if (userSquad) {
        await loadSquadLeaderboard(userSquad._id);
      }
      setLoading(false);
    };
    init();
  }, [loadGlobal, loadUserSquad, loadSquadLeaderboard]);

  const handleSquadChange = (newSquad) => {
    setSquad(newSquad);
    if (newSquad) {
      loadSquadLeaderboard(newSquad._id);
    } else {
      setSquadLeaderboard([]);
    }
  };

  const entries = view === "global" ? leaderboard : squadLeaderboard;

  return (
    <div className="min-h-screen">
      <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <SquadPanel squad={squad} onSquadChange={handleSquadChange} />

        <div className="flex items-center justify-between">
          {squad && (
            <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
              <button
                onClick={() => setView("global")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  view === "global"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Globe size={16} />
                Global
              </button>
              <button
                onClick={() => setView("squad")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  view === "squad"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users size={16} />
                Squad
              </button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={12} />
            <span>{weekRange}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </CardContent>
          </Card>
        ) : (
          <>
            {view === "squad" && !squad && (
              <Card>
                <CardContent className="py-8 text-center text-sm text-slate-400">
                  Join or create a squad to see squad leaderboard.
                </CardContent>
              </Card>
            )}
            <LeaderboardTable entries={entries} />
          </>
        )}
      </main>
    </div>
  );
};

export default LeaderboardPage;

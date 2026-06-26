import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import LeaderboardTable from "../components/LeaderboardTable";
import SquadPanel from "../components/SquadPanel";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, Users, Globe } from "lucide-react";
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

        {squad && (
          <div className="flex items-center gap-2">
            <Button
              variant={view === "global" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("global")}
            >
              <Globe size={14} className="mr-1.5" />
              Global
            </Button>
            <Button
              variant={view === "squad" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("squad")}
            >
              <Users size={14} className="mr-1.5" />
              Squad
            </Button>
          </div>
        )}

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

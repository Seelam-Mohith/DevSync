import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, Users, Check, UserPlus } from "lucide-react";
import useAuth from "../hooks/useAuth";
import api from "../lib/api";

const InvitePage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const [squad, setSquad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("devsync_theme") === "dark");
  const redirected = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("devsync_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      if (!redirected.current) {
        redirected.current = true;
        navigate(`/login?invite=${encodeURIComponent(code || "")}`, { replace: true });
      }
      return;
    }

    const fetchSquad = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/squads/invite/${code}`);
        setSquad(data.squad);
        const inSquad =
          data.squad.members?.some((m) => String(m?._id || m) === String(user?.id)) ||
          String(data.squad.leader?._id) === String(user?.id);
        setAlreadyMember(inSquad);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Invalid or expired invite link");
      } finally {
        setLoading(false);
      }
    };

    fetchSquad();
  }, [authLoading, isAuthenticated, code, user, navigate]);

  const handleJoin = async () => {
    setJoining(true);
    setError("");
    try {
      await api.post("/squads/join", { inviteCode: code });
      navigate("/leaderboard");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to join squad");
    } finally {
      setJoining(false);
    }
  };

  if (authLoading || (!isAuthenticated && !redirected.current)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
        <Card>
          <CardContent className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : error && !squad ? (
              <div className="space-y-4 text-center">
                <div className="text-5xl">🙇</div>
                <h1 className="text-xl font-semibold text-white">Invite not found</h1>
                <p className="text-sm text-slate-400">{error}</p>
                <Button onClick={() => navigate("/leaderboard")}>Go to Leaderboard</Button>
              </div>
            ) : squad ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                    <Users size={26} className="text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{squad.name}</h1>
                    <p className="text-sm text-slate-400">
                      {squad.leader?.name ? `Led by ${squad.leader.name}` : "A DevSync squad"} ·{" "}
                      {squad.memberCount || 1} member{(squad.memberCount || 1) > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {alreadyMember ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-green-400 flex items-center justify-center gap-2">
                      <Check size={16} /> You are already in this squad
                    </p>
                    <Button onClick={() => navigate("/leaderboard")}>Go to Leaderboard</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-center text-sm text-slate-400">
                      Join this squad and compete on the leaderboard.
                    </p>

                    {error && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                        {error}
                      </div>
                    )}

                    <Button className="w-full" onClick={handleJoin} disabled={joining}>
                      {joining ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <UserPlus size={16} />
                      )}
                      Join Squad
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default InvitePage;
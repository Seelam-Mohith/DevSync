import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, Code, GitBranch, Trophy, Loader2 } from "lucide-react";
import api from "../lib/api";

const avatarUrl = (seed) =>
  seed ? `https://api.dicebear.com/10.x/toon-head/svg?seed=${seed}` : null;

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("devsync_theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("devsync_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/user/${userId}`);
        setUser(data.user);
      } catch {
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-slate-400" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen">
        <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-red-400">{error || "User not found"}</p>
              <Link to="/leaderboard">
                <Button variant="outline" className="mt-4">Back to Leaderboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        <Link
          to="/leaderboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Leaderboard
        </Link>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-blue-500/30">
                {user.avatar ? (
                  <img src={avatarUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-600 text-xl font-bold text-white">
                    {(user.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <Trophy size={18} className="text-yellow-500" />
              <CardTitle className="text-sm font-medium text-slate-300">Coding Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Solved</span>
                <span className="font-semibold text-white">{user.totalSolved ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Acceptance Rate</span>
                <span className="font-semibold text-white">{user.acceptanceRate ?? 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Current Streak</span>
                <span className="font-semibold text-white">{user.currentStreak ?? 0} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">This Week Solved</span>
                <span className="font-semibold text-blue-400">{Math.max(0, (user.totalSolved ?? 0) - (user.totalSolvedAtWeekStart ?? 0))}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <Code size={18} className="text-yellow-500" />
              <CardTitle className="text-sm font-medium text-slate-300">LeetCode</CardTitle>
            </CardHeader>
            <CardContent>
              {user.leetcodeUsername ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">
                    <span className="text-slate-300">Username:</span>{" "}
                    <span className="font-medium text-white">@{user.leetcodeUsername}</span>
                  </p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-400">E: {user.easySolved ?? 0}</span>
                    <span className="text-yellow-400">M: {user.mediumSolved ?? 0}</span>
                    <span className="text-red-400">H: {user.hardSolved ?? 0}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Not linked</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <GitBranch size={18} className="text-white" />
              <CardTitle className="text-sm font-medium text-slate-300">GitHub</CardTitle>
            </CardHeader>
            <CardContent>
              {user.githubUsername ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">
                    <span className="text-slate-300">Username:</span>{" "}
                    <span className="font-medium text-white">@{user.githubUsername}</span>
                  </p>
                  <p className="text-xs text-slate-500">Repos: {user.totalRepositories ?? 0}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Not linked</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;

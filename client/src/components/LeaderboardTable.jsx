import { useState } from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const avatarUrl = (seed) =>
  seed ? `https://api.dicebear.com/10.x/toon-head/svg?seed=${seed}` : null;

const LeaderboardTable = ({ entries = [] }) => {
  const [hoveredCol, setHoveredCol] = useState(null);

  if (!entries.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No leaderboard data yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4">Rank</th>
                <th className="pb-2 pr-4">Developer</th>
                <th
                  className="pb-2 pr-4 relative"
                  onMouseEnter={() => setHoveredCol("activity")}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <span className="inline-flex items-center gap-1 cursor-pointer">
                    Total Activity
                    <Info size={13} className="text-slate-500" />
                  </span>
                  {hoveredCol === "activity" && (
                    <div className="absolute left-0 top-full z-50 mt-1 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 shadow-xl pointer-events-none">
                      Problems solved this week (Mon-Sun)
                    </div>
                  )}
                </th>
                <th
                  className="pb-2 relative"
                  onMouseEnter={() => setHoveredCol("score")}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <span className="inline-flex items-center gap-1 cursor-pointer">
                    Score
                    <Info size={13} className="text-slate-500" />
                  </span>
                  {hoveredCol === "score" && (
                    <div className="absolute left-0 top-full z-50 mt-1 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 shadow-xl pointer-events-none">
                      Total Activity × 5
                    </div>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.userId} className="border-b border-border/70 last:border-0">
                  <td className="py-3 pr-4 font-semibold">#{index + 1}</td>
                  <td className="py-3 pr-4">
                    <Link
                      to={`/profile/${entry.userId}`}
                      className="flex items-center gap-3 font-medium text-slate-200 transition-colors hover:text-blue-400"
                    >
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10">
                        {entry.avatar ? (
                          <img src={avatarUrl(entry.avatar)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-600 text-xs font-bold text-white">
                            {(entry.name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {entry.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{entry.totalActivity}</td>
                  <td className="py-3 font-semibold text-blue-400">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardTable;

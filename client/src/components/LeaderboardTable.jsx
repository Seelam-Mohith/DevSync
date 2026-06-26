import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const LeaderboardTable = ({ entries = [] }) => {
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
      <CardContent className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 pr-4">Rank</th>
              <th className="pb-2 pr-4">Developer</th>
              <th className="pb-2 pr-4">Total Activity</th>
              <th className="pb-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.userId} className="border-b border-border/70 last:border-0">
                <td className="py-3 pr-4 font-semibold">#{index + 1}</td>
                <td className="py-3 pr-4">
                  <Link
                    to={`/profile/${entry.userId}`}
                    className="font-medium text-slate-200 transition-colors hover:text-blue-400"
                  >
                    {entry.name}
                  </Link>
                </td>
                <td className="py-3 pr-4">{entry.entries}</td>
                <td className="py-3 font-semibold text-blue-400">{entry.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default LeaderboardTable;

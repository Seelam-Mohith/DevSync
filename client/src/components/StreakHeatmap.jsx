import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const bucketColor = (value) => {
  if (value === 0) return "bg-muted";
  if (value < 4) return "bg-teal-200 dark:bg-teal-800";
  if (value < 8) return "bg-teal-400 dark:bg-teal-600";
  return "bg-teal-600 dark:bg-teal-400";
};

const StreakHeatmap = ({ activities = [] }) => {
  if (!activities.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Streak Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No streak data available.</p>
        </CardContent>
      </Card>
    );
  }

  const cells = activities.slice(-28).map((entry) => {
    const intensity = entry.commits + entry.prs + entry.reviews;
    return {
      date: new Date(entry.date).toLocaleDateString(),
      intensity,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Streak Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell) => (
            <div
              key={cell.date}
              title={`${cell.date}: ${cell.intensity} events`}
              className={`h-8 rounded ${bucketColor(cell.intensity)}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakHeatmap;

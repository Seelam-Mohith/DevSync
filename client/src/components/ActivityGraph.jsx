import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const ActivityGraph = ({ activities = [] }) => {
  const data = activities.map((item) => ({
    day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
    commits: item.commits,
    prs: item.prs,
    reviews: item.reviews,
  }));

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activity to visualize yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Graph</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="commits" stroke="#14b8a6" strokeWidth={2} />
              <Line type="monotone" dataKey="prs" stroke="#0ea5e9" strokeWidth={2} />
              <Line type="monotone" dataKey="reviews" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityGraph;

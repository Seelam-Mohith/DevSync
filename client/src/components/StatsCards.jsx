import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Globe, CheckCircle2, Calendar, Code2, Target, Flame } from "lucide-react";

const StatsCards = ({ stats }) => {
  const IconComponent = ({ name }) => {
    const iconMap = {
      Activity: <Activity size={24} className="text-blue-400" />,
      Globe: <Globe size={24} className="text-orange-400" />,
      CheckCircle2: <CheckCircle2 size={24} className="text-green-400" />,
      Calendar: <Calendar size={24} className="text-purple-400" />,
      Code2: <Code2 size={24} className="text-yellow-400" />,
      Target: <Target size={24} className="text-rose-400" />,
      Flame: <Flame size={24} className="text-orange-500" />,
    };
    return iconMap[name] || <Activity size={24} className="text-slate-400" />;
  };

  const cards = [
    {
      label: "Problems Solved",
      value: stats?.totalSolved !== undefined ? stats.totalSolved : (stats?.totalPoints ?? 0),
      gradient: "from-yellow-500 via-amber-500 to-orange-500",
      icon: "Code2",
      subtitle: "LeetCode problems",
      trend: "Total solved",
    },
    {
      label: "Total Submissions",
      value: stats?.totalSubmissions ?? 0,
      gradient: "from-rose-500 via-red-500 to-pink-500",
      icon: "Target",
      subtitle: "Code submissions",
      trend: "All attempts",
    },
    {
      label: "Current Streak",
      value: `${stats?.currentStreak ?? 0} days`,
      gradient: "from-orange-500 via-red-500 to-rose-500",
      icon: "Flame",
      subtitle: "Daily submissions",
      trend: "Keep it up!",
    },
    {
      label: "Total Active Days",
      value: stats?.totalActiveDays ?? 0,
      gradient: "from-blue-500 via-cyan-500 to-indigo-500",
      icon: "Activity",
      subtitle: "Days with activity",
      trend: "Lifetime activity",
    },
    {
      label: "Acceptance Rate",
      value: `${stats?.acceptanceRate ?? 0}%`,
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      icon: "CheckCircle2",
      subtitle: "Success rate",
      trend: "Code accuracy",
    },
    {
      label: "This Week Solved",
      value: stats?.thisWeekSolved ?? 0,
      gradient: "from-purple-500 via-violet-500 to-pink-500",
      icon: "Calendar",
      subtitle: "Problems this week",
      trend: "Weekly progress",
    },

  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <Card className="overflow-hidden h-full group">
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-200">{item.label}</CardTitle>
                <div className="flex items-center justify-center h-8 w-8">
                  <IconComponent name={item.icon} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-3xl font-bold text-white">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-blue-300">
                <TrendingUp size={12} />
                <span>{item.trend}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;

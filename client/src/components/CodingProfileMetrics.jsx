import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Flame, Target, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const CodingProfileMetrics = ({ activities = [], stats = {} }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const totalProblemsSolved = stats?.totalProblems ?? activities.length;

  const calculateStreak = () => {
    if (!activities.length) return 0;
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    let streak = 0;
    const today = new Date();
    let currentDateCheck = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (const activity of sortedActivities) {
      const activityDate = new Date(
        new Date(activity.date).getFullYear(),
        new Date(activity.date).getMonth(),
        new Date(activity.date).getDate()
      );

      const dayDiff = Math.floor(
        (currentDateCheck - activityDate) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === streak) {
        streak++;
      } else if (dayDiff > streak) {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  const generateMonthCalendar = (date) => {
    const activityMap = new Map();
    activities.forEach((activity) => {
      const dateStr = new Date(activity.date)
        .toISOString()
        .split("T")[0];
      const intensity = activity.commits + activity.prs + activity.reviews;
      activityMap.set(dateStr, intensity);
    });

    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split("T")[0];
      const intensity = activityMap.get(dateStr) ?? 0;
      days.push({
        date: dateStr,
        day,
        intensity,
      });
    }

    return days;
  };

  const bucketColor = (intensity) => {
    if (intensity === 0) return "bg-white/5 border border-white/10";
    if (intensity < 4)
      return "bg-blue-500/30 border border-blue-400/30 shadow-md shadow-blue-500/10";
    if (intensity < 8)
      return "bg-blue-500/60 border border-blue-400/50 shadow-md shadow-blue-500/20";
    return "bg-blue-500/90 border border-blue-400/70 shadow-md shadow-blue-500/30";
  };

  const monthDays = generateMonthCalendar(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const metricVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Zap className="w-8 h-8 text-blue-400" />
          Dev Sync
        </h2>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div variants={metricVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card glow className="overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 group-hover:from-emerald-500/20 group-hover:to-cyan-500/20 transition-all duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-200">Total Problems Solved</CardTitle>
                <Target className="h-5 w-5 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <motion.p
                className="text-4xl font-bold text-white"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {totalProblemsSolved}
              </motion.p>
              <p className="mt-2 text-xs text-muted-foreground">LeetCode problems solved</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={metricVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card glow className="overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10 group-hover:from-orange-500/20 group-hover:to-pink-500/20 transition-all duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-200">Current Streak</CardTitle>
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <motion.p
                className="text-4xl font-bold text-white"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {currentStreak}
              </motion.p>
              <p className="mt-2 text-xs text-muted-foreground">
                {currentStreak > 1 ? "days" : "day"} active
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Month Calendar Heatmap */}
      <motion.div variants={metricVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
        <Card glow className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Submission Intensity</CardTitle>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToPreviousMonth}
                  className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
                <button
                  onClick={goToCurrentMonth}
                  className="rounded-lg px-4 py-2 text-sm hover:bg-gradient-to-r hover:from-primary hover:to-accent transition-all"
                >
                  {monthName}
                </button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToNextMonth}
                  className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!activities.length ? (
              <p className="text-sm text-muted-foreground">
                No activity data available. Start solving problems to see your heatmap!
              </p>
            ) : (
              <div className="space-y-4">
                {/* Day of week headers */}
                <div className="grid grid-cols-7 gap-2">
                  {dayNames.map((day) => (
                    <div key={day} className="h-6 text-center text-xs font-semibold text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map((cell, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {cell ? (
                        <div
                          title={`${cell.date}: ${cell.intensity} ${
                            cell.intensity === 1 ? "submission" : "submissions"
                          }`}
                          className={`relative h-10 rounded-lg transition-all duration-200 flex items-center justify-center text-xs font-medium cursor-pointer ${bucketColor(
                            cell.intensity
                          )}`}
                        >
                          <span className="text-foreground/80 font-semibold">{cell.day}</span>
                        </div>
                      ) : (
                        <div className="h-10" />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs text-slate-400">Activity</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Less</span>
                    <div className="flex gap-1">
                      {[0, 2, 5, 10].map((intensity, idx) => (
                        <motion.div
                          key={intensity}
                          className={`h-3 w-3 rounded ${
                            intensity === 0
                              ? "bg-white/10"
                              : intensity < 4
                              ? "bg-blue-500/30"
                              : intensity < 8
                              ? "bg-blue-500/60"
                              : "bg-blue-500/90"
                          }`}
                          whileHover={{ scale: 1.5 }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">More</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CodingProfileMetrics;

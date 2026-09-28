import React, { useState, useMemo } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatDuration } from '../activities/ActivityCard';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Calendar,
  Layers,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

export const WeeklyProgressWidget: React.FC = () => {
  const { activities, tasks, navigateTo } = useJourney();
  const [activeMetric, setActiveMetric] = useState<'both' | 'hours' | 'tasks'>('both');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [showPrevComparison, setShowPrevComparison] = useState(true);

  const today = useMemo(() => new Date(), []);

  // Rolling 7 days ending today
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const full = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Preceding week matching day (7 days prior)
      const prevD = new Date(d);
      prevD.setDate(prevD.getDate() - 7);
      const prevDateStr = prevD.toISOString().split('T')[0];

      const prevDayActs = activities.filter((a) => a.date === prevDateStr);
      const prevHours = Number(
        (prevDayActs.reduce((acc, a) => acc + a.durationMinutes, 0) / 60).toFixed(1)
      );
      const prevTasks = tasks.filter(
        (t) => t.status === 'completed' && t.completedAt && t.completedAt.slice(0, 10) === prevDateStr
      ).length;

      return {
        date: dateStr,
        label,
        full,
        prevHours,
        prevTasks,
      };
    });
  }, [today, activities, tasks]);

  // Calculate actual activity hours and tasks completed per day
  const weeklyData = useMemo(() => {
    return weekDays.map((d) => {
      const dayActivities = activities.filter((a) => a.date === d.date);
      const dayMinutes = dayActivities.reduce((acc, a) => acc + a.durationMinutes, 0);
      const dayHours = Number((dayMinutes / 60).toFixed(1));

      const dayTasksCompleted = tasks.filter((t) => {
        if (t.status !== 'completed' || !t.completedAt) return false;
        return t.completedAt.slice(0, 10) === d.date;
      }).length;

      const dayChangePct =
        d.prevHours > 0
          ? Number((((dayHours - d.prevHours) / d.prevHours) * 100).toFixed(1))
          : dayHours > 0
          ? 100
          : 0;

      return {
        day: d.label,
        fullDate: d.full,
        hours: dayHours,
        prevHours: d.prevHours,
        dayChangePct,
        minutes: dayMinutes,
        tasks: dayTasksCompleted,
        prevTasks: d.prevTasks,
        activityCount: dayActivities.length,
      };
    });
  }, [weekDays, activities, tasks]);

  // Aggregates for the current rolling week
  const totalWeeklyMinutes = weeklyData.reduce((acc, d) => acc + d.minutes, 0);
  const totalWeeklyHours = Number((totalWeeklyMinutes / 60).toFixed(1));
  const totalTasksCompletedThisWeek = weeklyData.reduce((acc, d) => acc + d.tasks, 0);

  // Dynamic values for preceding week (13 days ago to 7 days ago)
  const prevWeeklyDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });
  }, [today]);

  const prevActs = useMemo(
    () => activities.filter((a) => prevWeeklyDates.includes(a.date)),
    [activities, prevWeeklyDates]
  );
  const prevWeeklyMinutes = useMemo(
    () => prevActs.reduce((acc, a) => acc + a.durationMinutes, 0),
    [prevActs]
  );
  const prevWeeklyHours = Number((prevWeeklyMinutes / 60).toFixed(1));
  const prevWeeklyTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status === 'completed' &&
          t.completedAt &&
          prevWeeklyDates.includes(t.completedAt.slice(0, 10))
      ).length,
    [tasks, prevWeeklyDates]
  );
  const prevAllTasks = useMemo(
    () =>
      tasks.filter((t) => t.createdAt && prevWeeklyDates.includes(t.createdAt.slice(0, 10))).length,
    [tasks, prevWeeklyDates]
  );
  const prevCompletionRate =
    prevAllTasks > 0 ? Math.round((prevWeeklyTasks / prevAllTasks) * 100) : 0;

  // Percentage trend calculations
  const calculateTrend = (curr: number, prev: number) => {
    if (prev === 0) {
      if (curr === 0) return { pct: 0, isGrowth: true, formatted: '0%' };
      return { pct: 100, isGrowth: true, formatted: '+100%' };
    }
    const diff = curr - prev;
    const pct = Number(((diff / prev) * 100).toFixed(1));
    const isGrowth = pct >= 0;
    const formatted = `${isGrowth ? '+' : ''}${pct}%`;
    return { pct, isGrowth, formatted };
  };

  const timeTrend = calculateTrend(totalWeeklyMinutes, prevWeeklyMinutes);
  const tasksTrend = calculateTrend(totalTasksCompletedThisWeek, prevWeeklyTasks);

  // Overall task completion rate
  const allTasksCount = tasks.length;
  const allCompletedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const completionRate =
    allTasksCount > 0 ? Math.round((allCompletedTasksCount / allTasksCount) * 100) : 0;
  const rateTrend = calculateTrend(completionRate, prevCompletionRate);

  // Find peak activity day
  const peakDay = [...weeklyData].sort((a, b) => b.hours - a.hours)[0];

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Weekly Progress & Activity Trends
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Actual activity hours logged vs completed project tasks with previous-week growth rates
          </p>
        </div>

        {/* Metric Segmented Control & Previous Week Toggle */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Chart Type Toggle: Simple Bar vs Trend Line */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 text-xs">
            <button
              onClick={() => setChartType('bar')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Simple Bar View (Easiest to understand)"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Simple Bar</span>
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                chartType === 'line'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Trend Line View"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Trend Line</span>
            </button>
          </div>

          <button
            onClick={() => setShowPrevComparison(!showPrevComparison)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              showPrevComparison
                ? 'border-indigo-600/40 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'border-neutral-200 dark:border-neutral-700 bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span>Prev Week Baseline</span>
          </button>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeMetric === 'both'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              All Trends
            </button>
            <button
              onClick={() => setActiveMetric('hours')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeMetric === 'hours'
                  ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Activity Hours
            </button>
            <button
              onClick={() => setActiveMetric('tasks')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeMetric === 'tasks'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Completed Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row with Trend Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Time Logged */}
        <div className="p-3.5 rounded-lg border border-neutral-150 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span>Time Logged</span>
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
              {formatDuration(totalWeeklyMinutes)}
            </div>
          </div>
          
          <div className="mt-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">vs prev week</span>
            <div
              className={`flex items-center gap-1 font-mono font-semibold ${
                timeTrend.isGrowth
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {timeTrend.isGrowth ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{timeTrend.formatted}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tasks Done */}
        <div className="p-3.5 rounded-lg border border-neutral-150 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span>Tasks Done</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {allCompletedTasksCount} / {allTasksCount}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">vs prev week</span>
            <div
              className={`flex items-center gap-1 font-mono font-semibold ${
                tasksTrend.isGrowth
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {tasksTrend.isGrowth ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{tasksTrend.formatted}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="p-3.5 rounded-lg border border-neutral-150 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span>Completion Rate</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
              {completionRate}%
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">rate growth</span>
            <div
              className={`flex items-center gap-1 font-mono font-semibold ${
                rateTrend.isGrowth
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {rateTrend.isGrowth ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{rateTrend.formatted}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Daily Average Activity */}
        <div className="p-3.5 rounded-lg border border-neutral-150 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span>Daily Average</span>
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
              {Number((totalWeeklyHours / 7).toFixed(1))}h / day
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">vs 3.9h prev</span>
            <div className="flex items-center gap-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>+25.6%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Visual Guide Banner */}
      <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
            <span className="w-3 h-3 rounded-sm bg-indigo-600 inline-block shrink-0" />
            <span>🔵 Focus Hours (Active Time Logged)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block shrink-0" />
            <span>🟢 Tasks Completed (Checklist Items Done)</span>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
          💡 Anyone can see at a glance: taller bars = more time spent that day.
        </div>
      </div>

      {/* Chart Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-500 flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            {(activeMetric === 'both' || activeMetric === 'hours') && (
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                <span className="text-neutral-700 dark:text-neutral-300">Activity Time (Hours)</span>
              </div>
            )}
            {(activeMetric === 'both' || activeMetric === 'tasks') && (
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-neutral-700 dark:text-neutral-300">Tasks Completed</span>
              </div>
            )}
            {chartType === 'line' && showPrevComparison && (activeMetric === 'both' || activeMetric === 'hours') && (
              <div className="flex items-center gap-1.5 font-medium text-neutral-400 dark:text-neutral-500">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-neutral-400 dark:border-neutral-600 inline-block" />
                <span>Prev Week Hours</span>
              </div>
            )}
          </div>
          <span className="font-mono text-[11px] text-neutral-400">Sep 22 – Sep 28</span>
        </div>

        <div className="h-56 sm:h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={weeklyData}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis
                  dataKey="day"
                  stroke="#88888880"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#88888880"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-xl font-mono space-y-1.5 min-w-44">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 border-b border-neutral-150 dark:border-neutral-800 pb-1">
                            {data.day} · {data.fullDate}
                          </div>
                          <div className="text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                            <span>Activity Time:</span>
                            <span className="font-bold">{data.hours} hours</span>
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                            <span>Tasks Done:</span>
                            <span className="font-bold">{data.tasks} completed</span>
                          </div>
                          <div className="text-neutral-400 text-[10px] pt-1 border-t border-neutral-100 dark:border-neutral-800">
                            {data.activityCount} activity sessions recorded
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {(activeMetric === 'both' || activeMetric === 'hours') && (
                  <Bar
                    dataKey="hours"
                    name="Activity Hours"
                    fill="#6366F1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                )}
                {(activeMetric === 'both' || activeMetric === 'tasks') && (
                  <Bar
                    dataKey="tasks"
                    name="Tasks Completed"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                )}
              </BarChart>
            ) : (
              <LineChart
                data={weeklyData}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis
                  dataKey="day"
                  stroke="#88888880"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#88888880"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-xl font-mono space-y-1.5 min-w-44">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 border-b border-neutral-150 dark:border-neutral-800 pb-1">
                            {data.day} · {data.fullDate}
                          </div>
                          <div className="text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                            <span>Activity:</span>
                            <span className="font-bold">{data.hours}h ({data.activityCount} acts)</span>
                          </div>
                          {showPrevComparison && (
                            <div className="text-neutral-500 flex items-center justify-between text-[11px]">
                              <span>Prev Week:</span>
                              <span>{data.prevHours}h</span>
                            </div>
                          )}
                          <div className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                            <span>Tasks Done:</span>
                            <span className="font-bold">{data.tasks} completed</span>
                          </div>
                          {showPrevComparison && (
                            <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px]">
                              <span className="text-neutral-400">Day Change:</span>
                              <span className={data.dayChangePct >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                {data.dayChangePct >= 0 ? '+' : ''}{data.dayChangePct}%
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {showPrevComparison && (activeMetric === 'both' || activeMetric === 'hours') && (
                  <Line
                    type="monotone"
                    dataKey="prevHours"
                    name="Prev Week Hours"
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 4, fill: '#94A3B8' }}
                  />
                )}
                {(activeMetric === 'both' || activeMetric === 'hours') && (
                  <Line
                    type="monotone"
                    dataKey="hours"
                    name="Activity Hours"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#6366F1', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#6366F1' }}
                  />
                )}
                {(activeMetric === 'both' || activeMetric === 'tasks') && (
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    name="Tasks Completed"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: '#10B981', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#10B981' }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer link to full Analytics / Growth page */}
      <div className="pt-3 border-t border-neutral-150 dark:border-neutral-800/80 flex items-center justify-between text-xs">
        <div className="text-neutral-500 font-mono text-[11px] flex items-center gap-2">
          <span>Overall Activity Growth:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {timeTrend.formatted}
          </span>
          <span aria-hidden="true">·</span>
          <span>Tasks Completed Growth:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {tasksTrend.formatted}
          </span>
        </div>
        <button
          onClick={() => navigateTo('growth')}
          className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          <span>Explore Detailed Analytics & Heatmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};


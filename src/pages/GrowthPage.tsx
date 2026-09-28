import React, { useState, useMemo } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { formatDuration } from '../components/activities/ActivityCard';
import {
  Calendar,
  Clock,
  FolderGit2,
  Lightbulb,
  CheckCircle2,
  Trophy,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Plus,
  Layers,
  AlertCircle,
} from 'lucide-react';

export const GrowthPage: React.FC = () => {
  const { activities, projects, ideas, navigateTo, openActivityModal } = useJourney();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m' | '1y'>('7d');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);

  // Aggregated actual metrics (All-time recorded)
  const totalRecordedMinutes = activities.reduce((acc, a) => acc + a.durationMinutes, 0);
  const totalActivitiesCount = activities.length;
  const projectsWorkedOn = new Set(activities.map((a) => a.projectId).filter(Boolean)).size;
  const projectsCompleted = projects.filter((p) => p.status === 'completed').length;
  const ideasCreated = ideas.length;
  const goalsCompleted = activities.filter(
    (a) => a.type === 'achievement' || a.type === 'goal'
  ).length;

  // 1. Dynamic Daily/Period Chart Data based on timeRange
  const chartData = useMemo(() => {
    if (timeRange === '7d') {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayActs = activities.filter((a) => a.date === dateStr);
        const dayMins = dayActs.reduce((acc, a) => acc + a.durationMinutes, 0);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        return {
          day: dayLabel,
          date: dateStr,
          hours: Number((dayMins / 60).toFixed(1)),
          minutes: dayMins,
          count: dayActs.length,
        };
      });
    }

    if (timeRange === '30d') {
      return Array.from({ length: 30 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayActs = activities.filter((a) => a.date === dateStr);
        const dayMins = dayActs.reduce((acc, a) => acc + a.durationMinutes, 0);
        const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          day: dayLabel,
          date: dateStr,
          hours: Number((dayMins / 60).toFixed(1)),
          minutes: dayMins,
          count: dayActs.length,
        };
      });
    }

    if (timeRange === '3m') {
      // 12 rolling weeks
      return Array.from({ length: 12 }).map((_, i) => {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() - (11 - i) * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const startStr = weekStart.toISOString().split('T')[0];
        const endStr = weekEnd.toISOString().split('T')[0];

        const weekActs = activities.filter((a) => a.date >= startStr && a.date <= endStr);
        const weekMins = weekActs.reduce((acc, a) => acc + a.durationMinutes, 0);
        const weekLabel = `${weekStart.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`;

        return {
          day: weekLabel,
          date: `${startStr} to ${endStr}`,
          hours: Number((weekMins / 60).toFixed(1)),
          minutes: weekMins,
          count: weekActs.length,
        };
      });
    }

    // '1y' - 12 calendar months
    return Array.from({ length: 12 }).map((_, i) => {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
      const year = monthDate.getFullYear();
      const month = String(monthDate.getMonth() + 1).padStart(2, '0');
      const prefix = `${year}-${month}`;

      const monthActs = activities.filter((a) => a.date.startsWith(prefix));
      const monthMins = monthActs.reduce((acc, a) => acc + a.durationMinutes, 0);
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short' });

      return {
        day: monthLabel,
        date: prefix,
        hours: Number((monthMins / 60).toFixed(1)),
        minutes: monthMins,
        count: monthActs.length,
      };
    });
  }, [activities, timeRange, today]);

  const hasActivityInChart = chartData.some((d) => d.minutes > 0);

  // 2. Activity distribution by type
  const typeMinutesMap: Record<string, number> = {};
  activities.forEach((a) => {
    typeMinutesMap[a.type] = (typeMinutesMap[a.type] || 0) + a.durationMinutes;
  });

  const categoryColors: Record<string, string> = {
    reading: '#F59E0B',
    learning: '#6366F1',
    work: '#3B82F6',
    building: '#10B981',
    exercise: '#F43F5E',
    achievement: '#EAB308',
    personal: '#8B5CF6',
    meeting: '#06B6D4',
  };

  const distributionData = Object.keys(typeMinutesMap).map((type) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    rawType: type,
    value: Number((typeMinutesMap[type] / 60).toFixed(1)),
    minutes: typeMinutesMap[type],
    color: categoryColors[type] || '#94A3B8',
  }));

  // 3. Dynamic Weekly Activity Comparison (This 7 Days vs Previous 7 Days)
  const thisWeekStartDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  }, [today]);

  const prevWeekStartDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 13);
    return d.toISOString().split('T')[0];
  }, [today]);

  const thisWeekActivities = useMemo(
    () => activities.filter((a) => a.date >= thisWeekStartDate && a.date <= todayStr),
    [activities, thisWeekStartDate, todayStr]
  );
  const thisWeekMinutes = useMemo(
    () => thisWeekActivities.reduce((acc, a) => acc + a.durationMinutes, 0),
    [thisWeekActivities]
  );
  const thisWeekCategories = useMemo(
    () =>
      Array.from(
        new Set(thisWeekActivities.map((a) => a.type.charAt(0).toUpperCase() + a.type.slice(1)))
      ),
    [thisWeekActivities]
  );

  const prevWeekActivities = useMemo(
    () => activities.filter((a) => a.date >= prevWeekStartDate && a.date < thisWeekStartDate),
    [activities, prevWeekStartDate, thisWeekStartDate]
  );
  const prevWeekMinutes = useMemo(
    () => prevWeekActivities.reduce((acc, a) => acc + a.durationMinutes, 0),
    [prevWeekActivities]
  );

  const weeklyDiff = thisWeekMinutes - prevWeekMinutes;
  const weeklyChangePct =
    prevWeekMinutes > 0
      ? Math.round((weeklyDiff / prevWeekMinutes) * 100)
      : thisWeekMinutes > 0
      ? 100
      : 0;
  const isWeeklyGrowth = weeklyDiff >= 0;

  // 4. Dynamic GitHub-style activity calendar heatmap for last 16 weeks (112 days)
  const heatmapWeeks = useMemo(() => {
    return Array.from({ length: 16 }).map((_, wIdx) => {
      return Array.from({ length: 7 }).map((_, dIdx) => {
        const daysAgo = (15 - wIdx) * 7 + (6 - dIdx);
        const cellDate = new Date(today);
        cellDate.setDate(cellDate.getDate() - daysAgo);
        const cellDateStr = cellDate.toISOString().split('T')[0];

        const dayActs = activities.filter((a) => a.date === cellDateStr);
        const dayMinutes = dayActs.reduce((acc, a) => acc + a.durationMinutes, 0);
        const dayHours = Number((dayMinutes / 60).toFixed(1));

        let intensity = 0;
        if (dayMinutes > 300) intensity = 4;
        else if (dayMinutes > 180) intensity = 3;
        else if (dayMinutes > 60) intensity = 2;
        else if (dayMinutes > 0) intensity = 1;

        return {
          dateStr: cellDateStr,
          daysAgo,
          intensity,
          hours: dayHours,
          minutes: dayMinutes,
          count: dayActs.length,
        };
      });
    });
  }, [activities, today]);

  // 5. Project activity distribution
  const projectTimeMap: Record<string, number> = {};
  let standaloneMinutes = 0;
  activities.forEach((a) => {
    if (a.projectId) {
      projectTimeMap[a.projectId] = (projectTimeMap[a.projectId] || 0) + a.durationMinutes;
    } else {
      standaloneMinutes += a.durationMinutes;
    }
  });

  const projectAnalytics = Object.keys(projectTimeMap)
    .map((pId) => {
      const p = projects.find((x) => x.id === pId);
      return {
        id: pId,
        name: p ? p.name : 'Unknown Project',
        minutes: projectTimeMap[pId],
        hours: Number((projectTimeMap[pId] / 60).toFixed(1)),
      };
    })
    .sort((a, b) => b.minutes - a.minutes);

  if (standaloneMinutes > 0) {
    projectAnalytics.push({
      id: 'standalone',
      name: 'General / Standalone Activity',
      minutes: standaloneMinutes,
      hours: Number((standaloneMinutes / 60).toFixed(1)),
    });
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Growth & Analytics
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Live Database Data
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Understand your journey through your actual recorded activity in real-time. No fake or mock data.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 self-start sm:self-auto">
          {(['7d', '30d', '3m', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md uppercase transition-colors cursor-pointer ${
                timeRange === range
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Core Actual Recorded Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="text-[11px] text-neutral-500 font-medium">Total Activity</div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
            {formatDuration(totalRecordedMinutes)}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">All-time recorded</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="text-[11px] text-neutral-500 font-medium">Activities</div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
            {totalActivitiesCount}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Logged sessions</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="text-[11px] text-neutral-500 font-medium">Projects Active</div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
            {projectsWorkedOn}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Under execution</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="text-[11px] text-neutral-500 font-medium">Completed</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {projectsCompleted}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Projects shipped</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="text-[11px] text-neutral-500 font-medium">Ideas Created</div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
            {ideasCreated}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">In Idea Vault</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="text-[11px] text-neutral-500 font-medium">Achievements</div>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-1">
            {goalsCompleted}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Milestones logged</div>
        </div>
      </div>

      {/* 2. Charts Row: Daily Activity & Activity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Activity Hours Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Recorded Activity Volume ({timeRange.toUpperCase()})
              </h3>
              <p className="text-xs text-neutral-500">
                Live calculated hours tracked across {chartData.length} data intervals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-400">Hours</span>
              <button
                onClick={() => openActivityModal()}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Session</span>
              </button>
            </div>
          </div>

          {!hasActivityInChart ? (
            <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  No Recorded Activities in this {timeRange.toUpperCase()} Window
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm">
                  Log your daily reading, learning, building, or project tasks to visualize live growth trends without any simulated data.
                </p>
              </div>
              <button
                onClick={() => openActivityModal()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
              >
                Record Your First Activity
              </button>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    tickFormatter={(val) => `${val}h`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-lg font-mono">
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {data.day} ({data.date})
                            </div>
                            <div className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                              {data.hours} hours ({formatDuration(data.minutes)})
                            </div>
                            <div className="text-neutral-400 text-[10px] mt-0.5">
                              {data.count} session{data.count === 1 ? '' : 's'} recorded
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Activity Distribution Donut */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Activity Breakdown
            </h3>
            <p className="text-xs text-neutral-500">
              Time categorized by recorded activity type
            </p>

            {distributionData.length === 0 ? (
              <div className="h-44 w-full my-2 flex flex-col items-center justify-center text-center p-4">
                <Layers className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                <div className="text-xs text-neutral-500">No activity categories logged yet</div>
              </div>
            ) : (
              <div className="h-44 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      onClick={(entry: any) => setSelectedCategory(entry?.rawType || null)}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-lg font-mono">
                              <div>{payload[0].name}</div>
                              <div className="font-bold">{payload[0].value} hrs ({formatDuration(payload[0].payload.minutes)})</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
            {distributionData.slice(0, 6).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-neutral-600 dark:text-neutral-400">
                  {item.name}
                </span>
                <span className="ml-auto font-mono text-neutral-900 dark:text-neutral-100">
                  {item.value}h
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Dynamic Weekly Activity Comparison */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Weekly Activity Comparison
            </h3>
            <p className="text-xs text-neutral-500">
              Genuine values comparing your current 7-day window with the preceding 7-day period
            </p>
          </div>
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 self-start sm:self-auto ${
              prevWeekMinutes === 0 && thisWeekMinutes === 0
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                : isWeeklyGrowth
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {prevWeekMinutes === 0 && thisWeekMinutes === 0 ? (
              <span>Baseline Week</span>
            ) : isWeeklyGrowth ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>+{weeklyChangePct}% Growth</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>{weeklyChangePct}% Shift</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
            <div className="text-xs text-neutral-500 font-medium">This Week (Last 7 Days)</div>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 my-1">
              {formatDuration(thisWeekMinutes)}
            </div>
            <p className="text-xs text-neutral-400">
              {thisWeekCategories.length > 0
                ? `Focus across ${thisWeekCategories.slice(0, 4).join(', ')}`
                : 'No activities recorded in the last 7 days'}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
            <div className="text-xs text-neutral-500 font-medium">Previous Week</div>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 my-1">
              {formatDuration(prevWeekMinutes)}
            </div>
            <p className="text-xs text-neutral-400">
              {prevWeekMinutes > 0
                ? `${prevWeekActivities.length} recorded sessions in prior period`
                : 'No activities recorded in prior 7-day period'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Calendar Heatmap (Real 16 weeks / 112 days) */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Activity Heatmap
            </h3>
            <p className="text-xs text-neutral-500">
              Recorded presence over the past 16 weeks (112 days) mapped from actual database entries
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-400">
            <span>0m</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-neutral-200 dark:bg-neutral-800" title="0m logged" />
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-200 dark:bg-indigo-950" title="1-60m logged" />
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-400 dark:bg-indigo-800" title="1-3h logged" />
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 dark:bg-indigo-600" title="3-5h logged" />
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-800 dark:bg-indigo-400" title=">5h logged" />
            <span>&gt;5h</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-max">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day, dIdx) => {
                  let bg = 'bg-neutral-100 dark:bg-neutral-800';
                  if (day.intensity === 1) bg = 'bg-indigo-200 dark:bg-indigo-950';
                  if (day.intensity === 2) bg = 'bg-indigo-400 dark:bg-indigo-800';
                  if (day.intensity === 3) bg = 'bg-indigo-600 dark:bg-indigo-600';
                  if (day.intensity === 4) bg = 'bg-indigo-800 dark:bg-indigo-400';

                  return (
                    <div
                      key={dIdx}
                      onClick={() => navigateTo('daily')}
                      title={`${day.dateStr}: ${day.hours}h (${formatDuration(day.minutes)}) · ${day.count} sessions`}
                      className={`w-3 h-3 rounded-xs ${bg} transition-transform hover:scale-125 cursor-pointer`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Project Activity Breakdown */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Project Activity Breakdown
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            {projectAnalytics.length} tracked stream{projectAnalytics.length === 1 ? '' : 's'}
          </span>
        </div>

        {projectAnalytics.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
            <FolderGit2 className="w-8 h-8 text-neutral-400 mx-auto" />
            <div className="text-xs text-neutral-500">
              No project-specific activities logged yet. Connect activities to your projects to see distribution metrics.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {projectAnalytics.map((pa) => {
              const percentage =
                totalRecordedMinutes > 0
                  ? Math.round((pa.minutes / totalRecordedMinutes) * 100)
                  : 0;
              return (
                <div
                  key={pa.id}
                  onClick={() => {
                    if (pa.id !== 'standalone') {
                      navigateTo('project-detail', pa.id);
                    }
                  }}
                  className="group p-3 rounded-lg border border-neutral-150 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {pa.name}
                    </span>
                    <span className="font-mono text-neutral-600 dark:text-neutral-400">
                      {formatDuration(pa.minutes)} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

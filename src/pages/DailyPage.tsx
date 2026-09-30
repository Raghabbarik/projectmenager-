import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import { ActivityType, Task, PriorityLevel } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  Filter,
  Layers,
  CheckCircle2,
  Circle,
  Clock,
  Award,
  Check,
  RotateCcw,
  Sparkles,
  FolderGit2,
  Briefcase,
  Flame,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  User,
  Trash2,
} from 'lucide-react';
import { ActivityCard, formatDuration } from '../components/activities/ActivityCard';
import { EmptyState } from '../components/common/EmptyState';

export const DailyPage: React.FC = () => {
  const {
    activities,
    tasks,
    projects,
    toggleTaskComplete,
    addTask,
    deleteTask,
    toggleActivityComplete,
    completedDays,
    toggleDayComplete,
    isDayCompleted,
    openActivityModal,
    navigateTo,
  } = useJourney();

  // Timezone-safe local date utilities
  const getLocalDateString = (d: Date = new Date()): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizeDate = (dateVal: string | undefined | null): string => {
    if (!dateVal) return '';
    return dateVal.slice(0, 10);
  };

  const getTomorrowString = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getLocalDateString(d);
  };

  const getYesterdayString = (): string => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  };

  const todayStr = getLocalDateString(new Date());
  const tomorrowStr = getTomorrowString();
  const yesterdayStr = getYesterdayString();

  const [currentDate, setCurrentDate] = useState(todayStr);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sectionView, setSectionView] = useState<'all' | 'tasks' | 'work'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activityScope, setActivityScope] = useState<'day' | 'tomorrow' | 'upcoming' | 'all'>('day');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('high');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string>('personal');

  // Change date by offset in days (timezone-safe local arithmetic)
  const adjustDate = (days: number) => {
    const parts = currentDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + days);
    setCurrentDate(getLocalDateString(d));
  };

  const setToday = () => {
    setCurrentDate(todayStr);
    setActivityScope('day');
  };

  // Activities for this specific selected date
  const dayActivities = activities
    .filter((a) => normalizeDate(a.date) === currentDate)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  // Activities for tomorrow
  const tomorrowActivities = activities
    .filter((a) => normalizeDate(a.date) === tomorrowStr)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  // Upcoming activities (future dates beyond today)
  const upcomingActivities = activities
    .filter((a) => normalizeDate(a.date) > todayStr)
    .sort(
      (a, b) =>
        normalizeDate(a.date).localeCompare(normalizeDate(b.date)) ||
        (a.startTime || '00:00').localeCompare(b.startTime || '00:00')
    );

  // All activities sorted chronologically (newest first)
  const allSortedActivities = [...activities].sort(
    (a, b) =>
      normalizeDate(b.date).localeCompare(normalizeDate(a.date)) ||
      (b.startTime || '00:00').localeCompare(a.startTime || '00:00')
  );

  // Scoped activities to display based on selected scope tab
  const scopeActivities =
    activityScope === 'tomorrow'
      ? tomorrowActivities
      : activityScope === 'upcoming'
      ? upcomingActivities
      : activityScope === 'all'
      ? allSortedActivities
      : dayActivities;

  const filteredActivities = scopeActivities.filter((a) => {
    if (selectedTypeFilter === 'all') return true;
    return a.type === selectedTypeFilter;
  });

  const totalMinutes = dayActivities.reduce((acc, a) => acc + a.durationMinutes, 0);
  const completedActivitiesCount = dayActivities.filter((a) => !!a.completed).length;

  // Tasks for this date
  const dayTasks = tasks.filter((t) => {
    if (normalizeDate(t.dueDate) === currentDate) return true;
    if (t.completedAt && normalizeDate(t.completedAt) === currentDate) return true;
    if (!t.dueDate && t.createdAt && normalizeDate(t.createdAt) === currentDate) return true;
    return false;
  });

  const highPriorityCount = dayTasks.filter((t) => t.priority === 'high').length;
  const mediumPriorityCount = dayTasks.filter((t) => t.priority === 'medium').length;
  const lowPriorityCount = dayTasks.filter((t) => t.priority === 'low').length;

  const filteredDayTasks = dayTasks.filter((t) => {
    if (selectedPriorityFilter === 'all') return true;
    return t.priority === selectedPriorityFilter;
  });

  const completedDayTasks = dayTasks.filter((t) => t.status === 'completed');
  const pendingDayTasks = dayTasks.filter((t) => t.status !== 'completed');

  // Daily Journey Completion Status - 100% genuine dynamic calculations
  const isComplete = isDayCompleted(currentDate);
  const dailyTargetMinutes = 210; // 3.5 hours
  const timeProgressPct = Math.min(100, Math.round((totalMinutes / dailyTargetMinutes) * 100));
  const taskProgressPct =
    dayTasks.length > 0 ? Math.round((completedDayTasks.length / dayTasks.length) * 100) : 0;

  let overallDayProgress = 0;
  if (isComplete) {
    overallDayProgress = 100;
  } else if (dayTasks.length > 0 && dayActivities.length > 0) {
    overallDayProgress = Math.min(
      100,
      Math.round(taskProgressPct * 0.5 + timeProgressPct * 0.5)
    );
  } else if (dayTasks.length > 0) {
    overallDayProgress = taskProgressPct;
  } else if (dayActivities.length > 0) {
    overallDayProgress = timeProgressPct;
  } else {
    overallDayProgress = 0;
  }

  const filterTabs: { id: string; label: string }[] = [
    { id: 'all', label: 'All Activities' },
    { id: 'work', label: 'Work' },
    { id: 'building', label: 'Building' },
    { id: 'learning', label: 'Learning' },
    { id: 'reading', label: 'Reading' },
    { id: 'exercise', label: 'Exercise' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'achievement', label: 'Achievement' },
    { id: 'personal', label: 'Personal' },
  ];

  // Dynamic 9-day calendar window centered around currentDate
  const calendarDays = React.useMemo(() => {
    const days: string[] = [];
    const parts = currentDate.split('-').map(Number);
    for (let i = -4; i <= 4; i++) {
      const d = new Date(parts[0], parts[1] - 1, parts[2] + i);
      days.push(getLocalDateString(d));
    }
    return days;
  }, [currentDate]);

  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const isPersonal = !targetProjectId || targetProjectId === 'personal';
    addTask({
      projectId: isPersonal ? 'personal' : targetProjectId,
      isPersonal,
      title: newTaskTitle.trim(),
      status: 'in_progress',
      priority: newTaskPriority,
      dueDate: currentDate,
    });
    setNewTaskTitle('');
    setTargetProjectId('personal');
    setIsAddingTask(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
            <span>Daily Journey</span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isComplete
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              {isComplete ? 'Day Complete 🎉' : 'In Progress ⏳'}
            </span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Click the complete button on particular tasks and works, or complete the entire day
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Calendar View"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => openActivityModal({ type: 'work', date: currentDate })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 rounded-lg transition-colors border border-indigo-200/60 dark:border-indigo-900/40 cursor-pointer shadow-xs"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>+ Log Work</span>
          </button>

          <button
            onClick={() => openActivityModal({ date: currentDate })}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-[#e5e5cb] dark:text-[#1a120b] hover:bg-neutral-800 dark:hover:bg-[#d5cea3] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Date Navigator Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              onClick={() => adjustDate(-1)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 font-mono px-2">
              {formatDateDisplay(currentDate)}
            </div>

            <button
              onClick={() => adjustDate(1)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setCurrentDate(yesterdayStr);
                setActivityScope('day');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                currentDate === yesterdayStr
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-xs font-semibold'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              Yesterday
            </button>

            <button
              onClick={setToday}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                currentDate === todayStr
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentDate === todayStr ? 'bg-white' : 'bg-emerald-500'}`} />
              <span>Today</span>
            </button>

            <button
              onClick={() => {
                setCurrentDate(tomorrowStr);
                setActivityScope('day');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                currentDate === tomorrowStr
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs font-semibold'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              title="View Tomorrow's Schedule"
            >
              <span>Tomorrow</span>
              {tomorrowActivities.length > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    currentDate === tomorrowStr
                      ? 'bg-white text-purple-700'
                      : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                  }`}
                >
                  {tomorrowActivities.length}
                </span>
              )}
            </button>

            {/* Direct date picker */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setCurrentDate(e.target.value);
                    setActivityScope('day');
                  }
                }}
                className="px-2 py-1 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                title="Select any date"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 dark:text-neutral-400">
          <span>
            <strong className="text-neutral-900 dark:text-neutral-100">{dayTasks.length}</strong> tasks
          </span>
          <span>·</span>
          <span>
            <strong className="text-neutral-900 dark:text-neutral-100">{dayActivities.length}</strong> activities
          </span>
          <span>·</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {formatDuration(totalMinutes)}
          </span>
        </div>
      </div>

      {/* Tomorrow Activities Notification Alert Banner */}
      {currentDate === todayStr && tomorrowActivities.length > 0 && (
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/70 dark:bg-purple-950/20 text-xs gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-purple-900 dark:text-purple-200 truncate sm:whitespace-normal">
              You have <strong>{tomorrowActivities.length} Particular Work & Activity Session(s)</strong> scheduled for <strong>Tomorrow ({formatDateDisplay(tomorrowStr)})</strong>.
            </span>
          </div>
          <button
            onClick={() => {
              setCurrentDate(tomorrowStr);
              setActivityScope('day');
            }}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            View Tomorrow's Sessions →
          </button>
        </div>
      )}

      {/* 1. Daily Journey Completion Status & Action Card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Daily Journey Completion Progress
              </h2>
            </div>
            <p className="text-xs text-neutral-500">
              Track progress as you complete particular tasks and work sessions throughout this day
            </p>
          </div>

          {/* Action button to mark entire day complete or reopen */}
          <button
            onClick={() => toggleDayComplete(currentDate)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto ${
              isComplete
                ? 'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 shadow-md'
            }`}
          >
            {isComplete ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen Daily Journey</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Mark Day as Complete 🎉</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-600 dark:text-neutral-400 font-sans font-medium">
              Daily Journey Fulfillment
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {overallDayProgress}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isComplete ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${overallDayProgress}%` }}
            />
          </div>
        </div>

        {/* Quick Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Focus Time</span>
            </div>
            <div className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
              {formatDuration(totalMinutes)}
            </div>
            <div className="text-[10px] text-neutral-400">Target: {formatDuration(dailyTargetMinutes)}</div>
          </div>

          <div className="p-3 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tasks Done</span>
            </div>
            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {completedDayTasks.length} / {dayTasks.length}
            </div>
            <div className="text-[10px] text-neutral-400">{pendingDayTasks.length} pending</div>
          </div>

          <div className="p-3 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              <span>Work Completed</span>
            </div>
            <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
              {completedActivitiesCount} / {dayActivities.length}
            </div>
            <div className="text-[10px] text-neutral-400">Recorded sessions</div>
          </div>

          <div className="p-3 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Status</span>
            </div>
            <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {isComplete ? 'Goal Met' : pendingDayTasks.length === 0 ? 'Clear' : 'In Momentum'}
            </div>
            <div className="text-[10px] text-neutral-400">
              {isComplete ? 'Daily Journey done' : 'Click complete below'}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar density selector view */}
      {viewMode === 'calendar' && (
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-3">
          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            Activity Density & Surrounding Days
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {calendarDays.map((d) => {
              const count = activities.filter((a) => normalizeDate(a.date) === d).length;
              const isSelected = d === currentDate;
              const dayDone = isDayCompleted(d);
              const parts = d.split('-').map(Number);
              const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
              const miniLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const isTomorrowBadge = d === tomorrowStr;
              return (
                <button
                  key={d}
                  onClick={() => {
                    setCurrentDate(d);
                    setActivityScope('day');
                  }}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : isTomorrowBadge && count > 0
                      ? 'border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="text-[10px] text-neutral-400 font-mono">
                    {miniLabel}
                  </div>
                  <div className="text-sm font-semibold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 my-1 flex items-center justify-center gap-1">
                    <span>{count}</span>
                    {dayDone && <Check className="w-3 h-3 text-emerald-500" />}
                  </div>
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          dayDone ? 'bg-emerald-500' : isTomorrowBadge ? 'bg-purple-500' : 'bg-indigo-500'
                        }`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Section View Selector: All / Tasks / Work */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSectionView('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              sectionView === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            All Items ({dayTasks.length + dayActivities.length})
          </button>
          <button
            onClick={() => setSectionView('tasks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              sectionView === 'tasks'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <span>Particular Tasks</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {completedDayTasks.length}/{dayTasks.length}
            </span>
          </button>
          <button
            onClick={() => setSectionView('work')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              sectionView === 'work'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <span>Particular Work & Activities</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {completedActivitiesCount}/{dayActivities.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-neutral-500">
          Click any <strong className="text-emerald-600 dark:text-emerald-400">Complete</strong> button to mark items done
        </div>
      </div>

      {/* 2. PARTICULAR TASKS FOR THIS DAY SECTION */}
      {(sectionView === 'all' || sectionView === 'tasks') && (
        <section className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-150 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Particular Tasks for {currentDate === todayStr ? 'Today' : currentDate === tomorrowStr ? 'Tomorrow' : formatDateDisplay(currentDate)}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {completedDayTasks.length} of {dayTasks.length} Completed
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Click the <strong>Complete</strong> button or checkmark on any task to finish it
              </p>
            </div>

            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingTask ? 'Cancel' : '+ Add Task'}</span>
            </button>
          </div>

          {/* Quick inline task addition */}
          {isAddingTask && (
            <form onSubmit={handleCreateTask} className="p-4 sm:p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Add Particular Task for {currentDate}
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  Connecting to a project is optional
                </span>
              </div>

              {/* Task Title Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exercise (30m), Drink 2L water, Review pull request, Learn Redis..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                  autoFocus
                  required
                />
              </div>

              {/* Project Connection (Optional) + Priority in responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Project Connection (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center justify-between">
                    <span>Connect Project (Optional)</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                      {targetProjectId === 'personal' || !targetProjectId ? 'Personal (No Project)' : 'Connected'}
                    </span>
                  </label>
                  <select
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                  >
                    <option value="personal">👤 Personal Task (No Project)</option>
                    {projects.length > 0 && (
                      <optgroup label="Attach to Project (Optional)">
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            📁 {p.name} {p.clientId ? '(Client Project)' : '(Self Project)'}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    {targetProjectId === 'personal' || !targetProjectId
                      ? '✓ Purely personal task. Kept strictly on your daily journey and will never appear on client project boards.'
                      : '🔗 This task will be attached to the selected project deliverables board.'}
                  </p>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🔵 Low Priority</option>
                  </select>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Prioritize your key commitments for this day.
                  </p>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-150 dark:border-indigo-900/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTaskTitle('');
                    setTargetProjectId('personal');
                  }}
                  className="px-3.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Save Particular Task
                </button>
              </div>
            </form>
          )}

          {/* Priority Toggle Filter */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" />
                <span>Priority:</span>
              </span>
              {[
                { id: 'all', label: 'All', count: dayTasks.length, dot: 'bg-neutral-400' },
                { id: 'high', label: 'High', count: highPriorityCount, dot: 'bg-rose-500' },
                { id: 'medium', label: 'Medium', count: mediumPriorityCount, dot: 'bg-amber-500' },
                { id: 'low', label: 'Low', count: lowPriorityCount, dot: 'bg-blue-500' },
              ].map((tab) => {
                const isActive = selectedPriorityFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedPriorityFilter(tab.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer border ${
                      isActive
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white font-semibold shadow-xs'
                        : 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-100 dark:hover:bg-neutral-750'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive
                          ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
                          : 'bg-neutral-200/80 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedPriorityFilter !== 'all' && (
              <button
                onClick={() => setSelectedPriorityFilter('all')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                Reset priority filter
              </button>
            )}
          </div>

          {/* Task Items List with prominent Complete buttons */}
          {filteredDayTasks.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400 space-y-2">
              <p>
                {dayTasks.length === 0
                  ? 'No particular tasks scheduled for this day yet.'
                  : `No ${selectedPriorityFilter} priority tasks scheduled for this day.`}
              </p>
              {dayTasks.length > 0 && selectedPriorityFilter !== 'all' ? (
                <button
                  onClick={() => setSelectedPriorityFilter('all')}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  View All Tasks ({dayTasks.length})
                </button>
              ) : (
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + Add a Task Commitment
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDayTasks.map((task) => {
                const isTaskDone = task.status === 'completed';
                const proj = projects.find((p) => p.id === task.projectId);

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isTaskDone
                        ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Checkmark circle button */}
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`p-1.5 rounded-lg transition-transform active:scale-90 cursor-pointer ${
                          isTaskDone
                            ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                            : 'text-neutral-400 hover:text-emerald-600'
                        }`}
                        title={isTaskDone ? 'Mark task as in progress' : 'Mark task as completed'}
                      >
                        {isTaskDone ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950/60 stroke-[2.2]" />
                        ) : (
                          <Circle className="w-5 h-5 stroke-[1.8]" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap text-[11px] mb-0.5">
                          {proj && task.projectId !== 'personal' && !task.isPersonal ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded text-[10px] border border-indigo-200/60 dark:border-indigo-800/60">
                              <FolderGit2 className="w-2.5 h-2.5" />
                              <span>{proj.name}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded text-[10px] border border-amber-200/60 dark:border-amber-800/60">
                              <User className="w-2.5 h-2.5" />
                              <span>Personal Task</span>
                            </span>
                          )}
                          <span className="text-neutral-300 dark:text-neutral-700">·</span>
                          <span
                            className={`capitalize text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              task.priority === 'high'
                                ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            {task.priority}
                          </span>
                          {isTaskDone && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              ✓ Completed
                            </span>
                          )}
                        </div>

                        <div
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isTaskDone
                              ? 'line-through text-neutral-400 dark:text-neutral-500'
                              : 'text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          {task.title}
                        </div>
                      </div>
                    </div>

                    {/* Direct Actions: Complete Button & Delete */}
                    <div className="ml-3 shrink-0 flex items-center gap-1.5">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                          isTaskDone
                            ? 'bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800'
                            : 'bg-white hover:bg-emerald-50 dark:bg-neutral-800 dark:hover:bg-emerald-950/40 text-neutral-700 hover:text-emerald-700 dark:text-neutral-300 dark:hover:text-emerald-300 border-neutral-200 dark:border-neutral-700 shadow-2xs'
                        }`}
                        title={isTaskDone ? 'Click to reopen this task' : 'Click to complete this task'}
                      >
                        {isTaskDone ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 hover:text-emerald-600" />
                            <span>Complete Task</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Delete task"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 3. PARTICULAR WORK & ACTIVITIES SECTION */}
      {(sectionView === 'all' || sectionView === 'work') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Particular Work & Activity Sessions
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold">
                  {activityScope === 'day'
                    ? `${completedActivitiesCount} of ${dayActivities.length} Completed`
                    : `${filteredActivities.filter((a) => !!a.completed).length} of ${filteredActivities.length} Completed`}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {activityScope === 'day'
                  ? `Showing sessions for ${currentDate === todayStr ? 'Today' : currentDate === tomorrowStr ? 'Tomorrow' : formatDateDisplay(currentDate)}`
                  : activityScope === 'tomorrow'
                  ? `Showing sessions scheduled for Tomorrow (${formatDateDisplay(tomorrowStr)})`
                  : activityScope === 'upcoming'
                  ? `Showing upcoming sessions beyond today (${upcomingActivities.length} total)`
                  : `Showing all recorded sessions across all dates (${activities.length} total)`}
              </p>
            </div>

            <button
              onClick={() => openActivityModal({ date: activityScope === 'tomorrow' ? tomorrowStr : currentDate })}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer self-start sm:self-auto"
            >
              + Record Work Session
            </button>
          </div>

          {/* Scope Switcher Tabs */}
          <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActivityScope('day')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activityScope === 'day'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Selected Day ({dayActivities.length})</span>
            </button>

            <button
              onClick={() => setActivityScope('tomorrow')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activityScope === 'tomorrow'
                  ? 'bg-purple-600 text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tomorrow ({tomorrowActivities.length})</span>
            </button>

            <button
              onClick={() => setActivityScope('upcoming')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activityScope === 'upcoming'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-300'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Upcoming ({upcomingActivities.length})</span>
            </button>

            <button
              onClick={() => setActivityScope('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activityScope === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Recorded ({activities.length})</span>
            </button>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filterTabs.map((tab) => {
              const isActive = selectedTypeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTypeFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                      : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Activities Feed with Direct Complete Buttons */}
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <EmptyState
                title={
                  activityScope === 'tomorrow'
                    ? 'No work sessions scheduled for tomorrow'
                    : activityScope === 'upcoming'
                    ? 'No upcoming work sessions scheduled'
                    : activityScope === 'all'
                    ? 'No work sessions recorded yet'
                    : 'Nothing recorded for this day'
                }
                description={
                  activityScope === 'tomorrow'
                    ? 'Plan ahead by recording your planned coding, reading, or learning for tomorrow.'
                    : activityScope === 'upcoming'
                    ? 'Schedule upcoming work or learning sessions in advance.'
                    : 'How did you spend your time? Track your reading, coding, learning, or reflection.'
                }
                actionLabel={
                  activityScope === 'tomorrow'
                    ? '+ Schedule Work Session for Tomorrow'
                    : '+ Record Work Session'
                }
                onAction={() =>
                  openActivityModal({
                    date: activityScope === 'tomorrow' ? tomorrowStr : currentDate,
                  })
                }
              />
            ) : (
              filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  showDate={activityScope !== 'day' || activity.date !== currentDate}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};

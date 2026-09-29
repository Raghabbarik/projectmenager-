import React, { useState, useMemo } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  Plus,
  BookOpen,
  Brain,
  Briefcase,
  Code2,
  Clock,
  FolderGit2,
  Lightbulb,
  ArrowRight,
  SlidersHorizontal,
  Calendar,
  Globe,
  Sparkles,
  Users,
  Coffee,
  Dumbbell,
  Target,
  Trophy,
} from 'lucide-react';
import { ActivityCard, formatDuration } from '../components/activities/ActivityCard';
import { ProjectCard } from '../components/projects/ProjectCard';
import { IdeaCard } from '../components/ideas/IdeaCard';
import { WeeklyProgressWidget } from '../components/dashboard/WeeklyProgressWidget';

interface CategoryMeta {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeBg: string;
  borderHover: string;
}

const CATEGORY_DEFINITIONS: Record<string, CategoryMeta> = {
  work: {
    key: 'work',
    label: 'Work',
    icon: Briefcase,
    colorClass: 'text-blue-500',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    borderHover: 'hover:border-blue-400 dark:hover:border-blue-600',
  },
  building: {
    key: 'building',
    label: 'Building',
    icon: Code2,
    colorClass: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
  },
  learning: {
    key: 'learning',
    label: 'Learning',
    icon: Brain,
    colorClass: 'text-indigo-500',
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-600',
  },
  reading: {
    key: 'reading',
    label: 'Reading',
    icon: BookOpen,
    colorClass: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    borderHover: 'hover:border-amber-400 dark:hover:border-amber-600',
  },
  personal: {
    key: 'personal',
    label: 'Personal',
    icon: Coffee,
    colorClass: 'text-rose-500',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    borderHover: 'hover:border-rose-400 dark:hover:border-rose-600',
  },
  exercise: {
    key: 'exercise',
    label: 'Exercise',
    icon: Dumbbell,
    colorClass: 'text-orange-500',
    badgeBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    borderHover: 'hover:border-orange-400 dark:hover:border-orange-600',
  },
  meeting: {
    key: 'meeting',
    label: 'Meeting',
    icon: Users,
    colorClass: 'text-cyan-500',
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    borderHover: 'hover:border-cyan-400 dark:hover:border-cyan-600',
  },
  goal: {
    key: 'goal',
    label: 'Goal',
    icon: Target,
    colorClass: 'text-purple-500',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    borderHover: 'hover:border-purple-400 dark:hover:border-purple-600',
  },
  achievement: {
    key: 'achievement',
    label: 'Achievement',
    icon: Trophy,
    colorClass: 'text-yellow-500',
    badgeBg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    borderHover: 'hover:border-yellow-400 dark:hover:border-yellow-600',
  },
  custom: {
    key: 'custom',
    label: 'Custom',
    icon: Clock,
    colorClass: 'text-neutral-500',
    badgeBg: 'bg-neutral-500/10 dark:bg-neutral-500/20',
    borderHover: 'hover:border-neutral-400 dark:hover:border-neutral-600',
  },
};

export const DashboardPage: React.FC = () => {
  const {
    user,
    activities,
    projects,
    ideas,
    teamMembers,
    isAdmin,
    openActivityModal,
    openProjectModal,
    openIdeaModal,
    openNoteModal,
    navigateTo,
    openPublicEditor,
  } = useJourney();

  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState({
    overview: true,
    quickActions: true,
    weeklyProgress: true,
    todayTimeline: true,
    activeProjects: true,
    recentIdeas: true,
  });

  // Dynamic local date calculation to eliminate timezone offset discrepancies
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();
  const utcTodayStr = new Date().toISOString().split('T')[0];

  const todayActivities = activities
    .filter((a) => a.date === todayStr || a.date === utcTodayStr)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  const totalTodayMins = todayActivities.reduce(
    (acc, a) => acc + (Number(a.durationMinutes) || 0),
    0
  );

  // Group activities by normalized category type
  const activitiesByType = useMemo(() => {
    const map: Record<string, { mins: number; items: typeof todayActivities }> = {};
    todayActivities.forEach((a) => {
      const rawType = (a.type || 'custom').toLowerCase();
      const typeKey = rawType.includes('build') || rawType.includes('cod') ? 'building' : rawType;
      if (!map[typeKey]) {
        map[typeKey] = { mins: 0, items: [] };
      }
      map[typeKey].mins += Number(a.durationMinutes) || 0;
      map[typeKey].items.push(a);
    });
    return map;
  }, [todayActivities]);

  // Compute dynamic category overview cards:
  // 1. Categories that have active time logged today (ordered by most time spent)
  // 2. Filled with key routine categories (Work, Building, Learning, Reading, Personal, Exercise)
  const categoryCards = useMemo(() => {
    const activeCategories = Object.keys(activitiesByType).sort(
      (a, b) => activitiesByType[b].mins - activitiesByType[a].mins
    );

    const fallbackCoreOrder = ['work', 'building', 'learning', 'reading', 'personal', 'exercise'];
    const selectedTypes: string[] = [...activeCategories];

    for (const core of fallbackCoreOrder) {
      if (!selectedTypes.includes(core) && selectedTypes.length < 4) {
        selectedTypes.push(core);
      }
    }

    return selectedTypes.slice(0, 4).map((typeKey) => {
      const def = CATEGORY_DEFINITIONS[typeKey] || {
        key: typeKey,
        label: typeKey.charAt(0).toUpperCase() + typeKey.slice(1),
        icon: Clock,
        colorClass: 'text-neutral-500',
        badgeBg: 'bg-neutral-500/10',
        borderHover: 'hover:border-neutral-400 dark:hover:border-neutral-600',
      };

      const group = activitiesByType[typeKey];
      const mins = group ? group.mins : 0;
      const count = group ? group.items.length : 0;

      let subtitle = 'Not logged today';
      if (count === 1) {
        subtitle = group.items[0].title || '1 session logged';
      } else if (count > 1) {
        subtitle = `${group.items[0].title} (+${count - 1} more)`;
      }

      return {
        key: typeKey,
        label: def.label,
        icon: def.icon,
        colorClass: def.colorClass,
        badgeBg: def.badgeBg,
        borderHover: def.borderHover,
        mins,
        count,
        subtitle,
      };
    });
  }, [activitiesByType]);

  const activeProjects = projects
    .filter((p) => p.status === 'in_progress')
    .slice(0, 3);

  const recentIdeas = ideas.slice(0, 3);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedToday}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {getGreeting()}, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            How was your day? Record your activities, reflections, and build forward.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCustomizeOpen(!customizeOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Customize Widgets"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customize</span>
          </button>

          <button
            onClick={() => openActivityModal({ type: 'work', date: todayStr })}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 rounded-lg transition-colors border border-indigo-200/60 dark:border-indigo-900/40 cursor-pointer shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>+ Log Project Time</span>
          </button>

          <button
            onClick={() => openActivityModal({ date: todayStr })}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Admin Exclusive: Public Website CMS Editor Quick Access */}
      {user.role === 'admin' && (
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/50 dark:from-indigo-950/40 dark:via-neutral-900 dark:to-neutral-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Public Website CMS Editor
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                  Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                Edit headlines, hero copy, features, and FAQs for Home, About, and Contact pages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openPublicEditor('home')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Edit Public Site CMS</span>
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Site</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Admin: Team Members quick-nav card */}
      {isAdmin && (
        <div className="p-4 sm:p-5 rounded-2xl border border-violet-200/80 dark:border-violet-900/60 bg-gradient-to-r from-violet-50/70 via-white to-indigo-50/50 dark:from-violet-950/30 dark:via-neutral-900 dark:to-neutral-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Team Members</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-bold uppercase">Admin Only</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {teamMembers.length === 1
                  ? '1 member · '
                  : `${teamMembers.length} members · `}
                Manage allocations, credentials &amp; Supabase auth accounts.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('team-members')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {customizeOpen && (
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            Customize Dashboard Layout
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-neutral-600 dark:text-neutral-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleWidgets.overview}
                onChange={() =>
                  setVisibleWidgets((prev) => ({ ...prev, overview: !prev.overview }))
                }
                className="rounded border-neutral-300 text-indigo-600"
              />
              <span>Today Overview</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleWidgets.quickActions}
                onChange={() =>
                  setVisibleWidgets((prev) => ({ ...prev, quickActions: !prev.quickActions }))
                }
                className="rounded border-neutral-300 text-indigo-600"
              />
              <span>Quick Actions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleWidgets.weeklyProgress}
                onChange={() =>
                  setVisibleWidgets((prev) => ({ ...prev, weeklyProgress: !prev.weeklyProgress }))
                }
                className="rounded border-neutral-300 text-indigo-600"
              />
              <span>Weekly Progress</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleWidgets.todayTimeline}
                onChange={() =>
                  setVisibleWidgets((prev) => ({ ...prev, todayTimeline: !prev.todayTimeline }))
                }
                className="rounded border-neutral-300 text-indigo-600"
              />
              <span>Today&rsquo;s Timeline</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleWidgets.activeProjects}
                onChange={() =>
                  setVisibleWidgets((prev) => ({ ...prev, activeProjects: !prev.activeProjects }))
                }
                className="rounded border-neutral-300 text-indigo-600"
              />
              <span>Active Projects</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleWidgets.recentIdeas}
                onChange={() =>
                  setVisibleWidgets((prev) => ({ ...prev, recentIdeas: !prev.recentIdeas }))
                }
                className="rounded border-neutral-300 text-indigo-600"
              />
              <span>Recent Ideas</span>
            </label>
          </div>
        </div>
      )}

      {/* 1. Today's Overview Cards */}
      {visibleWidgets.overview && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Today&rsquo;s Overview
            </h2>
            <span className="text-xs font-mono text-neutral-400">
              {formatDuration(totalTodayMins)} tracked · {todayActivities.length} {todayActivities.length === 1 ? 'activity' : 'activities'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {categoryCards.map((card) => {
              const IconComp = card.icon;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => openActivityModal({ type: card.key as any, date: todayStr })}
                  title={`Click to log ${card.label} activity`}
                  className={`p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs text-left transition-all cursor-pointer group ${card.borderHover} hover:shadow-md`}
                >
                  <div className="flex items-center justify-between text-neutral-500 mb-2">
                    <span className="text-xs font-medium group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      {card.label}
                    </span>
                    <div className={`p-1 rounded-md ${card.badgeBg}`}>
                      <IconComp className={`w-3.5 h-3.5 ${card.colorClass}`} />
                    </div>
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                    {card.mins > 0 ? formatDuration(card.mins) : '0m'}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 truncate" title={card.subtitle}>
                    {card.subtitle}
                  </div>
                </button>
              );
            })}

            {/* 5th Summary Card: Activities */}
            <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Activities</span>
                <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                {todayActivities.length}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1 truncate">
                {todayActivities.length === 0
                  ? 'No entries today'
                  : `${todayActivities.length} logged today · ${formatDuration(totalTodayMins)}`}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Quick Actions */}
      {visibleWidgets.quickActions && (
        <section className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => openActivityModal({ date: todayStr })}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-500" />
            <span>Add Activity</span>
          </button>

          <button
            onClick={() => openProjectModal()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-500" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => openIdeaModal()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            <span>New Idea</span>
          </button>

          <button
            onClick={() => openNoteModal()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-sky-500" />
            <span>Add Note</span>
          </button>

          <button
            onClick={() => navigateTo('daily')}
            className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Full Daily Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* 3. Weekly Progress Summary & Activity Trends */}
      {visibleWidgets.weeklyProgress && (
        <section>
          <WeeklyProgressWidget />
        </section>
      )}

      {/* 4. Today's Activity Timeline */}
      {visibleWidgets.todayTimeline && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Today&rsquo;s Activity Timeline
              </h2>
              <p className="text-xs text-neutral-500">
                Chronological record of what you accomplished today
              </p>
            </div>
            <button
              onClick={() => navigateTo('daily')}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium"
            >
              View Daily Page
            </button>
          </div>

          <div className="space-y-2.5">
            {todayActivities.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/30">
                <p className="text-xs text-neutral-500 mb-3">
                  Nothing recorded yet today. How did you spend your morning?
                </p>
                <button
                  onClick={() => openActivityModal({ date: todayStr })}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
                >
                  Record First Activity
                </button>
              </div>
            ) : (
              todayActivities.map((act) => (
                <ActivityCard key={act.id} activity={act} />
              ))
            )}
          </div>
        </section>
      )}

      {/* 4. Active Projects */}
      {visibleWidgets.activeProjects && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Active Projects
              </h2>
              <p className="text-xs text-neutral-500">
                Things you are actively designing and delivering
              </p>
            </div>
            <button
              onClick={() => navigateTo('projects')}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium flex items-center gap-1"
            >
              <span>All Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Recent Ideas */}
      {visibleWidgets.recentIdeas && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Ideas in Vault
              </h2>
              <p className="text-xs text-neutral-500">
                Sparks captured for future exploration and building
              </p>
            </div>
            <button
              onClick={() => navigateTo('ideas')}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium flex items-center gap-1"
            >
              <span>Idea Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

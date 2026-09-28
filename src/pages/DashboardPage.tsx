import React, { useState } from 'react';
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
} from 'lucide-react';
import { ActivityCard, formatDuration } from '../components/activities/ActivityCard';
import { ProjectCard } from '../components/projects/ProjectCard';
import { IdeaCard } from '../components/ideas/IdeaCard';
import { WeeklyProgressWidget } from '../components/dashboard/WeeklyProgressWidget';

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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivities = activities
    .filter((a) => a.date === todayStr)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  // Calculate today's stats by type
  const readingMins = todayActivities
    .filter((a) => a.type === 'reading')
    .reduce((acc, a) => acc + a.durationMinutes, 0);

  const learningMins = todayActivities
    .filter((a) => a.type === 'learning')
    .reduce((acc, a) => acc + a.durationMinutes, 0);

  const workMins = todayActivities
    .filter((a) => a.type === 'work')
    .reduce((acc, a) => acc + a.durationMinutes, 0);

  const buildingMins = todayActivities
    .filter((a) => a.type === 'building')
    .reduce((acc, a) => acc + a.durationMinutes, 0);

  const totalTodayMins = todayActivities.reduce((acc, a) => acc + a.durationMinutes, 0);

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
              {formatDuration(totalTodayMins)} tracked · {todayActivities.length} activities
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Reading</span>
                <BookOpen className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                {readingMins > 0 ? formatDuration(readingMins) : '0m'}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Atomic Habits</div>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Learning</span>
                <Brain className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                {learningMins > 0 ? formatDuration(learningMins) : '0m'}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Firebase Auth</div>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Work</span>
                <Briefcase className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                {workMins > 0 ? formatDuration(workMins) : '0m'}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Client Website</div>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Building</span>
                <Code2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                {buildingMins > 0 ? formatDuration(buildingMins) : '0m'}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Dashboard UI</div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Activities</span>
                <Clock className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                {todayActivities.length}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Logged today</div>
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

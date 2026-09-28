import React, { useState, useMemo, useEffect } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  GitCommit,
  Plus,
  Building2,
  FolderGit2,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Filter,
  Layers,
  Flag,
  User,
  Trash2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Briefcase,
  Heart,
  BookOpen,
  Target,
  Coins,
  Search,
  Check,
} from 'lucide-react';
import { Milestone, MilestoneCategory, MilestoneStatus } from '../types';

interface TimelinePageProps {
  defaultStream?: 'projects' | 'personal';
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ defaultStream = 'projects' }) => {
  const {
    milestones,
    projects,
    clients,
    visibleProjects,
    visibleClients,
    isAdmin,
    isMember,
    user,
    activities,
    currentRoute,
    toggleMilestoneComplete,
    deleteMilestone,
    openMilestoneModal,
    navigateTo,
  } = useJourney();

  // TWO DEDICATED TIMELINE STREAMS:
  // 1. 'projects' -> Work Timeline (Project deliverables, client deadlines, reviews, handovers)
  // 2. 'personal' -> Personal Timeline (Private life goals, fitness, learning, habits, finance)
  const [activeTimelineStream, setActiveTimelineStream] = useState<'projects' | 'personal'>(defaultStream);

  // Sync the active stream when the route or defaultStream changes (e.g. clicking sidebar nav)
  useEffect(() => {
    if (currentRoute === 'personal-timeline') {
      setActiveTimelineStream('personal');
    } else if (currentRoute === 'timeline') {
      setActiveTimelineStream('projects');
    } else {
      setActiveTimelineStream(defaultStream);
    }
  }, [currentRoute, defaultStream]);

  // Sub-view for Projects Timeline:
  const [projectTimelineView, setProjectTimelineView] = useState<'client-projects' | 'internal-projects' | 'all'>(
    'client-projects'
  );

  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [personalCategoryFilter, setPersonalCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const accessibleProjects = isMember ? visibleProjects : projects;
  const accessibleClients = isMember ? visibleClients : clients;

  // Separate client projects vs internal projects
  const clientProjects = useMemo(
    () => accessibleProjects.filter((p) => Boolean(p.clientId && p.clientId !== 'self')),
    [accessibleProjects]
  );
  const internalProjects = useMemo(
    () => accessibleProjects.filter((p) => !p.clientId || p.clientId === 'self'),
    [accessibleProjects]
  );

  const clientProjectIds = useMemo(
    () => new Set(clientProjects.map((p) => p.id)),
    [clientProjects]
  );
  const internalProjectIds = useMemo(
    () => new Set(internalProjects.map((p) => p.id)),
    [internalProjects]
  );
  const accessibleProjectIds = useMemo(
    () => new Set(accessibleProjects.map((p) => p.id)),
    [accessibleProjects]
  );

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. FILTERED MILESTONES FOR PROJECTS & CLIENT TIMELINE
  const filteredProjectMilestones = useMemo(() => {
    return milestones
      .filter((m) => {
        // Exclude purely personal milestones
        if (m.scope === 'personal' || m.projectId === 'personal') return false;

        // Check project accessibility
        if (m.projectId && !accessibleProjectIds.has(m.projectId)) return false;

        const proj = accessibleProjects.find((p) => p.id === m.projectId);

        // Sub-view filters for Admin (or default for member)
        if (projectTimelineView === 'client-projects') {
          if (!proj || !clientProjectIds.has(proj.id)) return false;
          if (selectedClientId !== 'all' && proj.clientId !== selectedClientId) return false;
        } else if (projectTimelineView === 'internal-projects') {
          if (!proj || !internalProjectIds.has(proj.id)) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && m.status !== statusFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = m.name.toLowerCase().includes(q);
          const matchDesc = (m.description || '').toLowerCase().includes(q);
          const matchProj = (proj?.name || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchProj) return false;
        }

        return true;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [
    milestones,
    projectTimelineView,
    accessibleProjectIds,
    accessibleProjects,
    clientProjectIds,
    internalProjectIds,
    selectedClientId,
    statusFilter,
    searchQuery,
  ]);

  // 2. FILTERED MILESTONES FOR PERSONAL TIMELINE
  // STRICT PER-USER ISOLATION: every person sees ONLY their own personal milestones.
  // Seed milestones without createdBy are shown only to admin (they are the admin's sample data).
  // Each member has their own empty personal timeline when they first sign in.
  const filteredPersonalMilestones = useMemo(() => {
    const userEmail = (user.email || '').toLowerCase();
    return milestones
      .filter((m) => {
        // Must be a personal milestone
        const isPersonal = m.scope === 'personal' || m.projectId === 'personal';
        if (!isPersonal) return false;

        // Strict owner check: show only milestones created by this user
        if (m.createdBy) {
          return m.createdBy.toLowerCase() === userEmail;
        }

        // Seed milestones with no createdBy: only visible to admin
        // (they are the admin's default personal sample data, not shared)
        return isAdmin;
      })
      .filter((m) => {
        if (personalCategoryFilter !== 'all' && m.category !== personalCategoryFilter) return false;
        if (statusFilter !== 'all' && m.status !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = m.name.toLowerCase().includes(q);
          const matchDesc = (m.description || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [milestones, isAdmin, user.email, personalCategoryFilter, statusFilter, searchQuery]);


  // Project Milestones Aggregates
  const totalProjectMilestones = filteredProjectMilestones.length;
  const completedProjectMilestones = filteredProjectMilestones.filter((m) => m.status === 'completed').length;
  const pendingProjectMilestones = totalProjectMilestones - completedProjectMilestones;
  const projectCompletionRate =
    totalProjectMilestones > 0 ? Math.round((completedProjectMilestones / totalProjectMilestones) * 100) : 0;

  // Personal Milestones Aggregates
  const totalPersonalMilestones = filteredPersonalMilestones.length;
  const completedPersonalMilestones = filteredPersonalMilestones.filter((m) => m.status === 'completed').length;
  const pendingPersonalMilestones = totalPersonalMilestones - completedPersonalMilestones;
  const personalCompletionRate =
    totalPersonalMilestones > 0 ? Math.round((completedPersonalMilestones / totalPersonalMilestones) * 100) : 0;

  // Category Colors & Badges
  const getCategoryBadge = (cat?: MilestoneCategory) => {
    switch (cat) {
      case 'kickoff':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'design':
        return 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'development':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'review':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'delivery':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'deadline':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'learning':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'fitness':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'habit':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'career':
        return 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800';
      case 'finance':
        return 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'health':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'travel':
        return 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'personal':
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  const getCategoryIcon = (cat?: MilestoneCategory) => {
    switch (cat) {
      case 'learning':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'fitness':
      case 'health':
        return <Heart className="w-3.5 h-3.5" />;
      case 'habit':
        return <Target className="w-3.5 h-3.5" />;
      case 'career':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'finance':
        return <Coins className="w-3.5 h-3.5" />;
      case 'travel':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'personal':
        return <User className="w-3.5 h-3.5" />;
      default:
        return <GitCommit className="w-3.5 h-3.5" />;
    }
  };

  const personalCategoryPills = [
    { id: 'all', label: 'All Personal' },
    { id: 'learning', label: '📚 Learning' },
    { id: 'fitness', label: '🏃 Fitness' },
    { id: 'habit', label: '🎯 Habits' },
    { id: 'career', label: '💼 Career' },
    { id: 'finance', label: '💰 Finance' },
    { id: 'health', label: '🩺 Health' },
    { id: 'travel', label: '✈️ Travel' },
    { id: 'personal', label: '🌟 Goals' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Timelines & Milestones
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
              {isMember ? 'Member Portal' : 'Admin & Personal Portal'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Two distinct timelines: track client project deliverables and manage your private personal growth journey.
          </p>
        </div>

        {/* Action Button: Dynamic based on active stream */}
        <button
          onClick={() => openMilestoneModal(undefined, activeTimelineStream === 'personal' ? 'personal' : 'project')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto ${
            activeTimelineStream === 'personal'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeTimelineStream === 'personal'
              ? 'Add Personal Milestone'
              : 'Add Project Milestone'}
          </span>
        </button>
      </div>

      {/* PRIMARY DUAL TIMELINE SELECTOR */}
      <div className="p-1.5 rounded-2xl bg-neutral-800/50 dark:bg-neutral-800/50 border border-neutral-700/60 dark:border-neutral-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-1.5 flex-1">
          {/* Timeline 1: Projects & Client Timeline */}
          <button
            onClick={() => setActiveTimelineStream('projects')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTimelineStream === 'projects'
                ? 'bg-neutral-900 text-indigo-400 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Projects & Client Timeline</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 font-bold">
              {totalProjectMilestones}
            </span>
          </button>

          {/* Timeline 2: Personal Timeline */}
          <button
            onClick={() => setActiveTimelineStream('personal')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTimelineStream === 'personal'
                ? 'bg-neutral-900 text-emerald-400 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Personal Timeline</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold">
              {totalPersonalMilestones}
            </span>
          </button>
        </div>

        {/* Global Search Input */}
        <div className="relative sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTimelineStream === 'personal'
                ? 'Search personal goals...'
                : 'Search deliverables...'
            }
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* TIMELINE 1: PROJECTS & CLIENT TIMELINE VIEW                   */}
      {/* ============================================================== */}
      {activeTimelineStream === 'projects' && (
        <div className="space-y-6">
          {/* Sub-Filters Bar for Project Timeline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900/60 p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            {/* View Tabs for Admin (Client vs Internal vs All) */}
            {!isMember ? (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 overflow-x-auto">
                <button
                  onClick={() => setProjectTimelineView('client-projects')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    projectTimelineView === 'client-projects'
                      ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Client Projects</span>
                  <span className="text-[10px] font-mono px-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {clientProjectIds.size}
                  </span>
                </button>

                <button
                  onClick={() => setProjectTimelineView('internal-projects')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    projectTimelineView === 'internal-projects'
                      ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Internal Initiatives</span>
                  <span className="text-[10px] font-mono px-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
                    {internalProjectIds.size}
                  </span>
                </button>

                <button
                  onClick={() => setProjectTimelineView('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    projectTimelineView === 'all'
                      ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>Unified Work Feed</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 px-2 py-1">
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Allocated Client Projects & Deliverables</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                  {accessibleProjects.length} Assigned Project(s)
                </span>
              </div>
            )}

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2">
              {accessibleClients.length > 0 && (
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                >
                  <option value="all">All Clients</option>
                  {accessibleClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics Bar for Project Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="text-[11px] text-neutral-400 font-medium">Scheduled Deliverables</div>
              <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                {totalProjectMilestones}
              </div>
              <div className="text-[10px] text-neutral-400">Total milestones</div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="text-[11px] text-neutral-400 font-medium">Completed Deliverables</div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {completedProjectMilestones}
              </div>
              <div className="text-[10px] text-neutral-400">{projectCompletionRate}% fulfillment</div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="text-[11px] text-neutral-400 font-medium">Pending Delivery</div>
              <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {pendingProjectMilestones}
              </div>
              <div className="text-[10px] text-neutral-400">In execution</div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="text-[11px] text-neutral-400 font-medium">Active Project Streams</div>
              <div className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                {accessibleProjects.length}
              </div>
              <div className="text-[10px] text-neutral-400">Accessible projects</div>
            </div>
          </div>

          {/* Project Timeline Feed */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-150 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Project Deliverables & Phase Roadmap
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {filteredProjectMilestones.length} milestone{filteredProjectMilestones.length === 1 ? '' : 's'}
              </span>
            </div>

            {filteredProjectMilestones.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    No Project Milestones Found
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    {isMember
                      ? 'Add phase reviews, client deliverables, and handovers to your assigned client projects.'
                      : 'Add milestones, review dates, and client handover deadlines.'}
                  </p>
                </div>
                <button
                  onClick={() => openMilestoneModal(undefined, 'project')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                >
                  + Add First Project Milestone
                </button>
              </div>
            ) : (
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
                {filteredProjectMilestones.map((m) => {
                  const project = accessibleProjects.find((p) => p.id === m.projectId);
                  const client = clients.find((c) => c.id === project?.clientId);
                  const isDone = m.status === 'completed';
                  const isOverdue = !isDone && m.dueDate < todayStr;
                  const isToday = m.dueDate === todayStr;

                  return (
                    <div key={m.id} className="relative group">
                      {/* Timeline Node Dot */}
                      <button
                        onClick={() => toggleMilestoneComplete(m.id)}
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-emerald-500/30 shadow-md'
                            : isOverdue
                            ? 'bg-rose-500 text-white shadow-rose-500/30 shadow-md'
                            : 'bg-white dark:bg-neutral-900 border-2 border-indigo-600 text-indigo-600'
                        }`}
                        title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-2.5 h-2.5 fill-current" />
                        )}
                      </button>

                      {/* Milestone Card */}
                      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold capitalize flex items-center gap-1 ${getCategoryBadge(
                                m.category
                              )}`}
                            >
                              {getCategoryIcon(m.category)}
                              <span>{m.category || 'Milestone'}</span>
                            </span>

                            {client && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                <span>{client.company}</span>
                              </span>
                            )}

                            {project && (
                              <button
                                onClick={() => navigateTo('project-detail', project.id)}
                                className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <FolderGit2 className="w-3 h-3 text-neutral-400" />
                                <span>{project.name}</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-mono font-medium flex items-center gap-1 ${
                                isDone
                                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                  : isOverdue
                                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                                  : isToday
                                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                                  : 'text-neutral-500'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{m.dueDate}</span>
                              {isOverdue && <span className="text-[10px]">(Overdue)</span>}
                              {isToday && <span className="text-[10px]">(Today)</span>}
                            </span>

                            <button
                              onClick={() => deleteMilestone(m.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Delete Milestone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4
                            className={`text-sm font-bold ${
                              isDone
                                ? 'line-through text-neutral-400 dark:text-neutral-500'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {m.name}
                          </h4>
                          {m.description && (
                            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                              {m.description}
                            </p>
                          )}
                        </div>

                        {/* Creator & Status Footer */}
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-150 dark:border-neutral-800 text-[10px] text-neutral-400 font-mono">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>
                              Created by {m.createdByName || 'Admin'} ({m.createdByRole || 'admin'})
                            </span>
                          </span>

                          <button
                            onClick={() => toggleMilestoneComplete(m.id)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                          >
                            {isDone ? 'Mark Incomplete' : 'Mark Complete ✓'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TIMELINE 2: MY PERSONAL TIMELINE VIEW                          */}
      {/* ============================================================== */}
      {activeTimelineStream === 'personal' && (
        <div className="space-y-6">
          {/* Category Filter Pills for Personal Stream */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900/60 p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {personalCategoryPills.map((p) => {
                const isActive = personalCategoryFilter === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPersonalCategoryFilter(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shrink-0"
            >
              <option value="all">All Statuses</option>
              <option value="pending">In Progress / Active</option>
              <option value="completed">Achieved</option>
            </select>
          </div>

          {/* Quick Metrics Bar for Personal Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="text-[11px] text-neutral-400 font-medium">Personal Targets</div>
              <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                {totalPersonalMilestones}
              </div>
              <div className="text-[10px] text-neutral-400">Total life goals</div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="text-[11px] text-neutral-400 font-medium">Achieved Goals</div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {completedPersonalMilestones}
              </div>
              <div className="text-[10px] text-neutral-400">{personalCompletionRate}% achievement</div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="text-[11px] text-neutral-400 font-medium">In Active Progress</div>
              <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {pendingPersonalMilestones}
              </div>
              <div className="text-[10px] text-neutral-400">Under pursuit</div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
              <div className="text-[11px] text-neutral-400 font-medium">Privacy Status</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>100% Private to You</span>
              </div>
              <div className="text-[10px] text-neutral-400">Not shared with clients</div>
            </div>
          </div>

          {/* Personal Timeline Feed */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-150 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Personal Life, Growth & Goal Milestones
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {filteredPersonalMilestones.length} goal{filteredPersonalMilestones.length === 1 ? '' : 's'}
              </span>
            </div>

            {filteredPersonalMilestones.length === 0 ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                  <User className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    Your Personal Timeline is Private & Empty
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                    This space is yours alone — no one else can see it. Add goals for learning, fitness, habits, career, savings, or health milestones.
                  </p>
                </div>

                {/* Quick-start suggestion chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {[
                    { label: '📚 Learning Goal', cat: 'learning' },
                    { label: '🏃 Fitness Target', cat: 'fitness' },
                    { label: '🎯 30-Day Habit', cat: 'habit' },
                    { label: '💼 Career Win', cat: 'career' },
                    { label: '💰 Savings Goal', cat: 'finance' },
                    { label: '🩺 Health Check', cat: 'health' },
                  ].map((s) => (
                    <button
                      key={s.cat}
                      onClick={() => openMilestoneModal(undefined, 'personal')}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => openMilestoneModal(undefined, 'personal')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add My First Personal Goal</span>
                </button>
              </div>

            ) : (
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
                {filteredPersonalMilestones.map((m) => {
                  const isDone = m.status === 'completed';
                  const isOverdue = !isDone && m.dueDate < todayStr;
                  const isToday = m.dueDate === todayStr;

                  return (
                    <div key={m.id} className="relative group">
                      {/* Timeline Node Dot */}
                      <button
                        onClick={() => toggleMilestoneComplete(m.id)}
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-emerald-500/30 shadow-md'
                            : isOverdue
                            ? 'bg-rose-500 text-white shadow-rose-500/30 shadow-md'
                            : 'bg-white dark:bg-neutral-900 border-2 border-emerald-600 text-emerald-600'
                        }`}
                        title={isDone ? 'Mark as Active Target' : 'Mark as Achieved!'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-2.5 h-2.5 fill-current" />
                        )}
                      </button>

                      {/* Personal Milestone Card */}
                      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold capitalize flex items-center gap-1 ${getCategoryBadge(
                                m.category
                              )}`}
                            >
                              {getCategoryIcon(m.category)}
                              <span>{m.category || 'Personal Goal'}</span>
                            </span>

                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>Personal Journey</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-mono font-medium flex items-center gap-1 ${
                                isDone
                                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                  : isOverdue
                                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                                  : isToday
                                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                                  : 'text-neutral-500'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Target: {m.dueDate}</span>
                              {isOverdue && <span className="text-[10px] text-rose-500 font-semibold">(Overdue)</span>}
                              {isToday && <span className="text-[10px] text-amber-500 font-semibold">(Today)</span>}
                            </span>

                            <button
                              onClick={() => deleteMilestone(m.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Delete Goal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Motivation Notes */}
                        <div>
                          <h4
                            className={`text-sm font-bold ${
                              isDone
                                ? 'line-through text-neutral-400 dark:text-neutral-500'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {m.name}
                          </h4>
                          {m.description && (
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                              {m.description}
                            </p>
                          )}
                        </div>

                        {/* Status Footer */}
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-150 dark:border-neutral-800 text-[10px] text-neutral-400 font-mono">
                          <span className="flex items-center gap-1">
                            {isDone ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Achieved & Completed</span>
                              </span>
                            ) : (
                              <span className="text-neutral-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Active Target in Progress</span>
                              </span>
                            )}
                          </span>

                          <button
                            onClick={() => toggleMilestoneComplete(m.id)}
                            className={`text-xs font-semibold cursor-pointer hover:underline ${
                              isDone
                                ? 'text-neutral-500 dark:text-neutral-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {isDone ? 'Reopen Target' : 'Mark Achieved ✓'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import { Idea, IdeaStatus } from '../types';
import {
  Lightbulb,
  ArrowLeft,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  FolderGit2,
  Clock,
  TrendingUp,
  CheckCircle2,
  Tag,
  Copy,
  Check,
  Printer,
  Shield,
  User,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const IdeaDetailPage: React.FC = () => {
  const {
    ideas,
    selectedIdeaId,
    openIdeaModal,
    convertIdeaToProject,
    deleteIdea,
    requestDelete,
    updateIdea,
    projects,
    navigateTo,
    showToast,
  } = useJourney();

  const [copied, setCopied] = useState(false);

  // Resolve idea by selectedIdeaId or URL param
  const activeIdeaId =
    selectedIdeaId ||
    (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('id')
      : null);

  const idea = ideas.find((i) => i.id === activeIdeaId);

  useEffect(() => {
    if (idea?.title) {
      document.title = `${idea.title} · Idea · My Journey`;
    }
    return () => {
      document.title = 'My Journey';
    };
  }, [idea]);

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <button
          onClick={() => navigateTo('ideas')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Idea Vault</span>
        </button>
        <EmptyState
          icon={Lightbulb}
          title="Idea not found"
          description="The requested idea could not be found or may have been deleted."
          actionLabel="View Idea Vault"
          onAction={() => navigateTo('ideas')}
        />
      </div>
    );
  }

  const linkedProject = projects.find((p) => p.id === idea.relatedProjectId);

  const stages: { id: IdeaStatus; label: string; icon: any }[] = [
    { id: 'idea', label: 'Raw Spark', icon: Lightbulb },
    { id: 'planning', label: 'Planning', icon: Clock },
    { id: 'building', label: 'Building', icon: TrendingUp },
    { id: 'project', label: 'Active Project', icon: FolderGit2 },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === idea.status);

  const handleStatusChange = (newStatus: IdeaStatus) => {
    updateIdea(idea.id, { status: newStatus });
    showToast(`Idea moved to "${stages.find((s) => s.id === newStatus)?.label}"`, 'info');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${idea.title}\n\n${idea.description}`);
    setCopied(true);
    showToast('Idea copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getPriorityBadge = (priority: Idea['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Top Nav Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => navigateTo('ideas')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Idea Vault</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {idea.status !== 'project' && idea.status !== 'completed' && (
            <button
              onClick={() => convertIdeaToProject(idea.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Convert to Project</span>
            </button>
          )}

          <button
            onClick={() => openIdeaModal(idea.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() =>
              requestDelete({
                title: 'Delete Idea?',
                message: `Are you sure you want to permanently delete "${idea.title}"?`,
                confirmLabel: 'Delete Idea',
                isDestructive: true,
                onConfirm: () => {
                  deleteIdea(idea.id);
                  navigateTo('ideas');
                },
              })
            }
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-neutral-200 dark:border-neutral-700 hover:border-rose-200 transition-colors cursor-pointer"
            title="Delete idea"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Idea Document Container */}
      <article className="p-6 sm:p-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
        {/* Document Header */}
        <header className="space-y-4 pb-6 border-b border-neutral-150 dark:border-neutral-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
              {idea.category || 'General Idea'}
            </span>
            <span
              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border ${getPriorityBadge(
                idea.priority
              )}`}
            >
              {idea.priority} Priority
            </span>
            <span className="text-xs font-mono text-neutral-400">
              ID: {idea.id}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
            {idea.title}
          </h1>

          {/* Creator & Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                {(idea.createdByName || 'Admin').slice(0, 1).toUpperCase()}
              </div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {idea.createdByName || 'Administrator'}
              </span>
              <span className="text-neutral-400">·</span>
              <span className="font-mono text-[11px]">
                {idea.createdAt ? idea.createdAt.slice(0, 10) : 'Recent'}
              </span>
            </div>

            {linkedProject && (
              <button
                onClick={() => navigateTo('project-detail', linkedProject.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold hover:underline cursor-pointer border border-indigo-200/50"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Connected Project: {linkedProject.name}</span>
              </button>
            )}
          </div>
        </header>

        {/* Lifecycle Pipeline Stepper */}
        <section className="space-y-2 p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-150 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Lifecycle Stage
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Click stage to update status
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {stages.map((st, idx) => {
              const isCurrent = st.id === idea.status;
              const isPassed = currentStageIndex > idx;
              const IconComp = st.icon;

              return (
                <button
                  key={st.id}
                  onClick={() => handleStatusChange(st.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20 shadow-xs'
                      : isPassed
                      ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-white dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <IconComp
                      className={`w-3.5 h-3.5 ${
                        isCurrent
                          ? 'text-amber-600 dark:text-amber-400'
                          : isPassed
                          ? 'text-emerald-600'
                          : 'text-neutral-400'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-neutral-400">
                      Step {idx + 1}
                    </span>
                  </div>
                  <div className="text-xs font-bold truncate">{st.label}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Content Body */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Description & Concept Details
          </h2>
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
            <div className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap font-sans leading-relaxed select-text">
              {idea.description}
            </div>
          </div>
        </section>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

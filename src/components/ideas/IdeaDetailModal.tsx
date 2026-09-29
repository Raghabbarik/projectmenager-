import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useJourney } from '../../context/JourneyContext';
import { Idea, IdeaStatus } from '../../types';
import { openIdeaInNewTab } from '../../utils/tabUtils';
import {
  Lightbulb,
  X,
  Edit2,
  Trash2,
  FolderGit2,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  Shield,
  FileText,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

interface IdeaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: Idea | null;
}

export const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({
  isOpen,
  onClose,
  idea,
}) => {
  const {
    openIdeaModal,
    convertIdeaToProject,
    deleteIdea,
    requestDelete,
    updateIdea,
    projects,
    navigateTo,
    showToast,
  } = useJourney();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !idea) return null;

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-start gap-3.5 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                  {idea.category || 'General'}
                </span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${getPriorityBadge(
                    idea.priority
                  )}`}
                >
                  {idea.priority} Priority
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  ID: {idea.id}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-snug">
                {idea.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => openIdeaInNewTab(idea)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
              title="Open in new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Open in Tab</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Creator & Date Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-150 dark:border-neutral-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                {(idea.createdByName || 'Admin').slice(0, 1).toUpperCase()}
              </div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {idea.createdByName || 'Administrator'}
              </span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-500">{idea.createdBy || 'Admin User'}</span>
            </div>

            <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created on {idea.createdAt ? idea.createdAt.slice(0, 10) : 'Recent'}</span>
            </div>
          </div>

          {/* Interactive Pipeline Stage Stepper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Idea Lifecycle Pipeline
              </span>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 font-mono">
                Click any step to update stage
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {stages.map((st, idx) => {
                const isCurrent = st.id === idea.status;
                const isPassed = currentStageIndex > idx;
                const IconComponent = st.icon;

                return (
                  <button
                    key={st.id}
                    onClick={() => handleStatusChange(st.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm ring-2 ring-amber-500/20'
                        : isPassed
                        ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <IconComponent className="w-4 h-4" />
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold">{st.label}</div>
                      <div className="text-[9px] text-neutral-400 font-mono">
                        Stage {idx + 1}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Hypothesis / Description (Full View) */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Core Hypothesis &amp; Problem Solved</span>
            </h3>
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/70 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap selection:bg-amber-200 selection:text-neutral-900 font-sans">
              {idea.description || 'No description provided.'}
            </div>
          </div>

          {/* Detailed Notes if present */}
          {idea.notes && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Deep Notes &amp; Observations</span>
              </h3>
              <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {idea.notes}
              </div>
            </div>
          )}

          {/* Tags */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Tags &amp; Keywords</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {idea.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Link / Conversion Status */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {linkedProject
                    ? `Linked to Project: ${linkedProject.name}`
                    : 'Turn Idea into Action'}
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {linkedProject
                    ? `Status: ${linkedProject.status.toUpperCase()} · ${linkedProject.progress}% complete`
                    : 'Create an active project card, tasks, and client allocation directly from this idea.'}
                </p>
              </div>
            </div>

            {linkedProject ? (
              <button
                onClick={() => {
                  onClose();
                  navigateTo('project-detail', linkedProject.id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <span>Go to Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  convertIdeaToProject(idea.id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Convert to Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-150 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 shrink-0">
          <button
            onClick={() =>
              requestDelete({
                title: 'Delete Idea?',
                message: `Are you sure you want to permanently delete "${idea.title}"?`,
                confirmLabel: 'Delete Idea',
                isDestructive: true,
                onConfirm: () => {
                  deleteIdea(idea.id);
                  onClose();
                },
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-neutral-200 dark:border-neutral-700 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openIdeaInNewTab(idea)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Open in a separate browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
              <span>New Tab</span>
            </button>
            <button
              onClick={() => {
                onClose();
                openIdeaModal(idea.id);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Idea</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

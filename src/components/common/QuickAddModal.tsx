import React from 'react';
import { useJourney } from '../../context/JourneyContext';
import { Clock, FolderPlus, Lightbulb, FileText, CheckSquare, Building2, X } from 'lucide-react';

export const QuickAddModal: React.FC = () => {
  const {
    quickAddOpen,
    setQuickAddOpen,
    openActivityModal,
    openProjectModal,
    openIdeaModal,
    openNoteModal,
    openClientModal,
    projects,
    addTask,
    showToast,
  } = useJourney();

  if (!quickAddOpen) return null;

  const handleSelect = (action: 'activity' | 'project' | 'idea' | 'note' | 'task' | 'client') => {
    setQuickAddOpen(false);
    if (action === 'activity') openActivityModal();
    if (action === 'project') openProjectModal();
    if (action === 'idea') openIdeaModal();
    if (action === 'note') openNoteModal();
    if (action === 'client') openClientModal();
    if (action === 'task') {
      const targetProject = projects[0]?.id || '';
      if (!targetProject) {
        openProjectModal();
        return;
      }
      const title = window.prompt('Quick Task Title:');
      if (title && title.trim()) {
        addTask({
          projectId: targetProject,
          title: title.trim(),
          status: 'todo',
          priority: 'medium',
        });
      }
    }
  };

  const options = [
    {
      id: 'activity' as const,
      title: 'Record Activity & Project Time',
      description: 'Log time on self projects, client deliverables, or habits',
      icon: Clock,
      color: 'text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20',
      shortcut: 'A',
    },
    {
      id: 'project' as const,
      title: 'New Project (Self or Client)',
      description: 'Create a self initiative or client deliverable',
      icon: FolderPlus,
      color: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20',
      shortcut: 'P',
    },
    {
      id: 'client' as const,
      title: 'Add Client',
      description: 'Add an external client and connect projects',
      icon: Building2,
      color: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20',
      shortcut: 'C',
    },
    {
      id: 'idea' as const,
      title: 'Capture Idea',
      description: 'Save a spark in your Idea Vault before it slips away',
      icon: Lightbulb,
      color: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20',
      shortcut: 'I',
    },
    {
      id: 'note' as const,
      title: 'Write Note',
      description: 'Store research, takeaways, or meeting specs',
      icon: FileText,
      color: 'text-sky-500 bg-sky-500/10 dark:bg-sky-500/20',
      shortcut: 'N',
    },
    {
      id: 'task' as const,
      title: 'Quick Task',
      description: 'Add an action item to your active project',
      icon: CheckSquare,
      color: 'text-purple-500 bg-purple-500/10 dark:bg-purple-500/20',
      shortcut: 'T',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-2xl sm:rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Quick Action
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              What do you want to add to your journey?
            </p>
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className="flex items-center gap-3.5 p-3 rounded-lg border border-neutral-150 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900/80 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-all text-left group cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${opt.color} transition-transform group-hover:scale-105 shrink-0`}>
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {opt.title}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                      {opt.shortcut}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

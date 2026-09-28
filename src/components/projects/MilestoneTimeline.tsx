import React, { useState } from 'react';
import { Milestone } from '../../types';
import { useJourney } from '../../context/JourneyContext';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, Edit2 } from 'lucide-react';

interface MilestoneTimelineProps {
  projectId: string;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ projectId }) => {
  const { milestones, addMilestone, toggleMilestone, deleteMilestone, openMilestoneModal } = useJourney();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const projectMilestones = milestones
    .filter((m) => m.projectId === projectId)
    .sort((a, b) => a.order - b.order);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMilestone({
      projectId,
      name: name.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      order: projectMilestones.length + 1,
    });

    setName('');
    setDescription('');
    setDueDate('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Project Milestones
          </h3>
          <p className="text-xs text-neutral-500">
            Track key delivery targets and achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openMilestoneModal(projectId)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Milestone Wizard</span>
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-3 animate-in fade-in duration-150"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Milestone Name *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Beta Release..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Scope or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Save Milestone
            </button>
          </div>
        </form>
      )}

      {/* Timeline Tree */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
        {projectMilestones.length === 0 ? (
          <div className="text-xs text-neutral-400 py-6">
            No milestones defined for this project yet.
          </div>
        ) : (
          projectMilestones.map((ms, idx) => {
            const isCompleted = ms.status === 'completed';
            return (
              <div key={ms.id} className="relative group">
                {/* Node icon */}
                <button
                  onClick={() => toggleMilestone(ms.id)}
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-white dark:bg-neutral-900 transition-colors cursor-pointer ${
                    isCompleted
                      ? 'text-emerald-500 ring-2 ring-emerald-500/20'
                      : 'text-neutral-400 hover:text-indigo-500'
                  }`}
                  title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-1">
                        <span className="font-mono text-neutral-400">Step {idx + 1}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {ms.dueDate}
                        </span>
                        {ms.completedAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Completed {ms.completedAt}
                            </span>
                          </>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-semibold leading-snug ${
                          isCompleted
                            ? 'text-neutral-900 dark:text-neutral-100'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        {ms.name}
                      </h4>

                      {ms.description && (
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                          {ms.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteMilestone(ms.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-600 transition-opacity"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

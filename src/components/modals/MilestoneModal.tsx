import React, { useState, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  X,
  Plus,
  GitCommit,
  Calendar,
  Layers,
  CheckCircle2,
  FolderGit2,
  Flag,
  Sparkles,
  User,
  Building2,
  BookOpen,
  Heart,
  Target,
  Briefcase,
  Coins,
} from 'lucide-react';
import { MilestoneCategory, MilestoneStatus, MilestoneScope } from '../../types';

export const MilestoneModal: React.FC = () => {
  const {
    isMilestoneModalOpen,
    closeMilestoneModal,
    milestoneModalProjectId,
    milestoneModalScope,
    visibleProjects,
    projects,
    isAdmin,
    user,
    addMilestone,
    clients,
  } = useJourney();

  const selectableProjects = isAdmin ? projects : visibleProjects;

  const [scope, setScope] = useState<MilestoneScope>('project');
  const [projectId, setProjectId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<MilestoneCategory>('milestone');
  const [status, setStatus] = useState<MilestoneStatus>('pending');

  useEffect(() => {
    if (isMilestoneModalOpen) {
      const initialScope: MilestoneScope = milestoneModalScope || (milestoneModalProjectId ? 'project' : 'project');
      setScope(initialScope);
      if (milestoneModalProjectId) {
        setProjectId(milestoneModalProjectId);
      } else if (selectableProjects.length > 0) {
        setProjectId(selectableProjects[0].id);
      }
      setName('');
      setDescription('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setCategory(initialScope === 'personal' ? 'personal' : 'milestone');
      setStatus('pending');
    }
  }, [isMilestoneModalOpen, milestoneModalProjectId, milestoneModalScope, selectableProjects]);

  if (!isMilestoneModalOpen) return null;

  const projectPresets = [
    { label: '🚀 Project Kickoff', cat: 'kickoff' as MilestoneCategory },
    { label: '🎨 Design & Wireframes', cat: 'design' as MilestoneCategory },
    { label: '💻 Core Development Phase', cat: 'development' as MilestoneCategory },
    { label: '🔍 Client Feedback & Review', cat: 'review' as MilestoneCategory },
    { label: '📦 Final Delivery & Handover', cat: 'delivery' as MilestoneCategory },
    { label: '🏁 Critical Project Deadline', cat: 'deadline' as MilestoneCategory },
  ];

  const personalPresets = [
    { label: '📚 Complete Skill / Tech Certification', cat: 'learning' as MilestoneCategory },
    { label: '🏃 Health & Fitness Target', cat: 'fitness' as MilestoneCategory },
    { label: '🎯 30-Day Consistent Habit Streak', cat: 'habit' as MilestoneCategory },
    { label: '💼 Career & Role Promotion Milestone', cat: 'career' as MilestoneCategory },
    { label: '💰 Personal Savings / Budget Milestone', cat: 'finance' as MilestoneCategory },
    { label: '🌟 Personal Goal & Growth Reflection', cat: 'personal' as MilestoneCategory },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetProj = selectableProjects.find((p) => p.id === projectId);

    addMilestone({
      scope,
      projectId: scope === 'project' ? (projectId || (targetProj ? targetProj.id : 'proj-1')) : 'personal',
      name: name.trim(),
      description: description.trim(),
      dueDate,
      category,
      status,
      order: Date.now(),
      createdBy: user.email,
      createdByName: user.name,
      createdByRole: user.role || 'admin',
    });

    closeMilestoneModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="max-w-md w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-150 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs ${scope === 'personal' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
              {scope === 'personal' ? <User className="w-4 h-4 stroke-[2.2]" /> : <GitCommit className="w-4 h-4 stroke-[2.2]" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {scope === 'personal' ? 'Add Personal Milestone' : 'Add Project Milestone'}
              </h2>
              <p className="text-[11px] text-neutral-500">
                {scope === 'personal'
                  ? 'Record a personal life, habit, learning, or health milestone'
                  : 'Add target deliverable or phase to project schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={closeMilestoneModal}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Scope Selector: Project vs Personal */}
        <div className="p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center gap-1 border border-neutral-200/80 dark:border-neutral-700/80">
          <button
            type="button"
            onClick={() => {
              setScope('project');
              setCategory('milestone');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              scope === 'project'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Project & Client</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScope('personal');
              setCategory('personal');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              scope === 'personal'
                ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal Milestone</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
            {scope === 'personal' ? 'Personal Goal Presets' : 'Quick Phase Presets'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(scope === 'personal' ? personalPresets : projectPresets).map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setName(p.label.replace(/^[^\s]+\s/, ''));
                  setCategory(p.cat);
                }}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors cursor-pointer ${
                  scope === 'personal'
                    ? 'border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                    : 'border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Selector (Only for project scope) */}
          {scope === 'project' && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Select Project <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {selectableProjects.length === 0 ? (
                  <option value="">No allocated projects available</option>
                ) : (
                  selectableProjects.map((p) => {
                    const client = clients.find((c) => c.id === p.clientId);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} {client ? `(Client: ${client.company})` : '(Internal Project)'}
                      </option>
                    );
                  })
                )}
              </select>
            </div>
          )}

          {/* Personal Scope Indicator (When scope === 'personal') */}
          {scope === 'personal' && (
            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <User className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>This milestone is private to you and tracked on your Personal Timeline.</span>
            </div>
          )}

          {/* Milestone Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {scope === 'personal' ? 'Personal Goal / Target Title' : 'Milestone / Deliverable Title'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                scope === 'personal'
                  ? 'e.g. Complete 50 Hours of System Design Study'
                  : 'e.g. Figma Prototype Sign-off'
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Target Date & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Target Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category / Type
              </label>
              {scope === 'personal' ? (
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="personal">Personal Goal</option>
                  <option value="learning">Learning & Study</option>
                  <option value="fitness">Health & Fitness</option>
                  <option value="career">Career Growth</option>
                  <option value="finance">Finance & Savings</option>
                  <option value="habit">Habit Streak</option>
                  <option value="health">Wellness & Health</option>
                  <option value="travel">Travel & Life</option>
                </select>
              ) : (
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="kickoff">Kickoff</option>
                  <option value="design">Design & UX</option>
                  <option value="development">Development</option>
                  <option value="review">Review & Feedback</option>
                  <option value="delivery">Delivery</option>
                  <option value="milestone">Key Milestone</option>
                  <option value="deadline">Hard Deadline</option>
                </select>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Initial Status
            </label>
            <div className="flex gap-2">
              {(['pending', 'in_progress', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors cursor-pointer ${
                    status === st
                      ? scope === 'personal'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {scope === 'personal' ? 'Personal Motivation / Notes (Optional)' : 'Deliverable Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                scope === 'personal'
                  ? 'Why is this milestone meaningful? What actions will get you there?'
                  : 'What specifically needs to be accomplished by this date?'
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={closeMilestoneModal}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                scope === 'personal'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{scope === 'personal' ? 'Add Personal Milestone' : 'Add to Project Timeline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

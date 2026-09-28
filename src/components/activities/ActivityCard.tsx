import React from 'react';
import { Activity } from '../../types';
import { useJourney } from '../../context/JourneyContext';
import {
  BookOpen,
  Brain,
  Briefcase,
  Code2,
  Dumbbell,
  Target,
  Users,
  Trophy,
  Coffee,
  MoreVertical,
  Clock,
  FolderGit2,
  Copy,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Check,
} from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  showDate?: boolean;
}

export const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'reading':
      return BookOpen;
    case 'learning':
      return Brain;
    case 'work':
      return Briefcase;
    case 'building':
      return Code2;
    case 'exercise':
      return Dumbbell;
    case 'goal':
      return Target;
    case 'meeting':
      return Users;
    case 'achievement':
      return Trophy;
    case 'personal':
      return Coffee;
    default:
      return Clock;
  }
};

export const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'reading':
      return 'text-amber-600 dark:text-amber-400 bg-amber-500/10';
    case 'learning':
      return 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10';
    case 'work':
      return 'text-blue-600 dark:text-blue-400 bg-blue-500/10';
    case 'building':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10';
    case 'exercise':
      return 'text-rose-600 dark:text-rose-400 bg-rose-500/10';
    case 'achievement':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10';
    default:
      return 'text-neutral-600 dark:text-neutral-400 bg-neutral-500/10';
  }
};

export const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, showDate = false }) => {
  const {
    projects,
    clients,
    openActivityModal,
    duplicateActivity,
    requestDelete,
    deleteActivity,
    toggleActivityComplete,
    navigateTo,
  } = useJourney();

  const [menuOpen, setMenuOpen] = React.useState(false);
  const Icon = getActivityIcon(activity.type);
  const colorClass = getActivityColor(activity.type);

  const linkedProject = projects.find((p) => p.id === activity.projectId);
  const linkedClient = clients.find((c) => c.id === activity.clientId);
  const isCompleted = !!activity.completed;

  return (
    <div
      className={`relative group p-4 rounded-xl border transition-all shadow-xs ${
        isCompleted
          ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/15 dark:bg-emerald-950/10'
          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Complete Toggle Button / Icon */}
          <button
            onClick={() => toggleActivityComplete(activity.id)}
            className={`p-2 rounded-lg shrink-0 transition-transform active:scale-95 cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-white shadow-xs'
                : colorClass
            }`}
            title={isCompleted ? 'Mark work as in progress' : 'Click to mark this work complete'}
          >
            {isCompleted ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Icon className="w-4 h-4 stroke-[1.8]" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            {/* Title & Metadata */}
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
              <span className="capitalize font-medium text-neutral-700 dark:text-neutral-300">
                {activity.type}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums font-semibold text-neutral-800 dark:text-neutral-200">
                {formatDuration(activity.durationMinutes)}
              </span>
              {activity.startTime && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {activity.startTime}
                    {activity.endTime ? ` - ${activity.endTime}` : ''}
                  </span>
                </>
              )}
              {showDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-neutral-500">{activity.date}</span>
                </>
              )}

              {/* Status Badge */}
              <span aria-hidden="true">·</span>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 font-semibold text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span>Logged Work</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm font-semibold leading-snug ${
                  isCompleted
                    ? 'text-neutral-800 dark:text-neutral-200 line-through decoration-neutral-300 dark:decoration-neutral-600'
                    : 'text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {activity.title}
              </h4>
            </div>

            {activity.description && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                {activity.description}
              </p>
            )}

            {/* Linked Entities & Tags */}
            <div className="flex items-center gap-2 flex-wrap mt-2.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {linkedProject && (
                <button
                  onClick={() => navigateTo('project-detail', linkedProject.id)}
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                >
                  <FolderGit2 className="w-3 h-3" />
                  <span>{linkedProject.name}</span>
                </button>
              )}

              {linkedClient && (
                <>
                  {linkedProject && <span aria-hidden="true">·</span>}
                  <button
                    onClick={() => navigateTo('client-detail', linkedClient.id)}
                    className="hover:underline cursor-pointer"
                  >
                    Client: {linkedClient.company}
                  </button>
                </>
              )}

              {activity.tags && activity.tags.length > 0 && (
                <>
                  {(linkedProject || linkedClient) && <span aria-hidden="true">·</span>}
                  <span>{activity.tags.join(' · ')}</span>
                </>
              )}
            </div>

            {activity.notes && (
              <div className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 italic bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded border border-neutral-150 dark:border-neutral-800">
                &ldquo;{activity.notes}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Action Controls: Complete Button & Menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => toggleActivityComplete(activity.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              isCompleted
                ? 'bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border-emerald-300/60 dark:border-emerald-800'
                : 'bg-white hover:bg-emerald-50 dark:bg-neutral-800 dark:hover:bg-emerald-950/40 text-neutral-700 hover:text-emerald-700 dark:text-neutral-300 dark:hover:text-emerald-300 border-neutral-200 dark:border-neutral-700 shadow-2xs'
            }`}
            title={isCompleted ? 'Mark this work item as in progress' : 'Mark this work item as completed'}
          >
            {isCompleted ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Completed</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
                <span>Complete</span>
              </>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-32 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-1 z-20">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    toggleActivityComplete(activity.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isCompleted ? 'Reopen' : 'Complete'}</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openActivityModal(activity, activity.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    duplicateActivity(activity.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    requestDelete({
                      title: 'Delete Activity?',
                      message: `Are you sure you want to remove "${activity.title}"? This cannot be undone.`,
                      confirmLabel: 'Delete Activity',
                      onConfirm: () => deleteActivity(activity.id),
                    });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

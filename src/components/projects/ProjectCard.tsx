import React from 'react';
import { Project } from '../../types';
import { useJourney } from '../../context/JourneyContext';
import {
  FolderGit2,
  Calendar,
  CheckSquare,
  Milestone as MilestoneIcon,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowUpRight,
  Code2,
  Database,
  FileText,
  Building2,
  User,
  ExternalLink,
  Globe,
  Check,
} from 'lucide-react';
import { formatDuration } from '../activities/ActivityCard';

interface ProjectCardProps {
  project: Project;
  layout?: 'grid' | 'list';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, layout = 'grid' }) => {
  const {
    tasks,
    milestones,
    activities,
    clients,
    navigateTo,
    openProjectModal,
    requestDelete,
    deleteProject,
    isAdmin,
    approveProject,
    rejectProject,
  } = useJourney();

  const [menuOpen, setMenuOpen] = React.useState(false);

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.status === 'completed');
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const projectActivities = activities.filter((a) => a.projectId === project.id);
  const totalMinutes = projectActivities.reduce((acc, a) => acc + a.durationMinutes, 0);
  const linkedClient = clients.find((c) => c.id === project.clientId);
  const planFilesCount = (project.planFiles || []).length;

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-rose-600 dark:text-rose-400';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-neutral-500';
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'planning':
        return 'Planning';
      case 'on_hold':
        return 'On Hold';
      case 'completed':
        return 'Completed';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  if (layout === 'list') {
    return (
      <div
        onClick={() => navigateTo('project-detail', project.id)}
        className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-indigo-300 dark:hover:border-indigo-800/60 hover:shadow-md transition-all shadow-xs cursor-pointer gap-4"
      >
        <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
            <FolderGit2 className="w-5 h-5 stroke-[1.8]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mb-0.5 flex-wrap">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {getStatusLabel(project.status)}
              </span>
              <span aria-hidden="true">·</span>
              <span className={`capitalize font-medium ${getPriorityColor(project.priority)}`}>
                {project.priority} Priority
              </span>
              <span aria-hidden="true">·</span>
              {linkedClient ? (
                <span className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-300">
                  <Building2 className="w-3 h-3" />
                  <span>{linkedClient.company}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-400 font-medium">
                  <User className="w-3 h-3 text-indigo-500" />
                  <span>Self Project</span>
                </span>
              )}
              {project.approvalStatus === 'pending' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] animate-pulse">
                    <Clock className="w-2.5 h-2.5" />
                    Pending Approval
                  </span>
                </>
              )}
              {project.approvalStatus === 'approved' && project.createdBy && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px]">
                    <Check className="w-2.5 h-2.5" />
                    Approved
                  </span>
                </>
              )}
            </div>

            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {project.name}
            </div>

            {/* Quick Tech Specs in List */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px]">
              {project.githubUrl && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono">
                  <Code2 className="w-3 h-3" />
                  <span>GitHub</span>
                </span>
              )}
              {(project.databaseType || project.databaseUrl) && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                  <Database className="w-3 h-3 text-indigo-500" />
                  <span>{project.databaseType?.split(' ')[0] || 'Database'}</span>
                </span>
              )}
              {(project.publishUrl || project.liveUrl) && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-medium">
                  <Globe className="w-3 h-3 text-emerald-500" />
                  <span>Published</span>
                </span>
              )}
              {planFilesCount > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                  <FileText className="w-3 h-3 text-amber-500" />
                  <span>{planFilesCount} files</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800">
          <div className="w-28 sm:w-32">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mb-1">
              <span>Progress</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{project.progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-neutral-500 font-mono">
              {completedTasks.length}/{projectTasks.length} tasks · {projectMilestones.length} milestones
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">
              {formatDuration(totalMinutes)} logged
            </div>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => openProjectModal(project.id)}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Edit Project"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigateTo('project-detail', project.id)}
              className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
              title="Open Project Details & Plan Files"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigateTo('project-detail', project.id)}
      className="relative group flex flex-col justify-between p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-indigo-300 dark:hover:border-indigo-800/70 hover:shadow-md transition-all shadow-xs cursor-pointer"
    >
      <div>
        {/* Top Badges & Options Menu */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 flex-wrap">
            <span className="font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {getStatusLabel(project.status)}
            </span>
            <span aria-hidden="true">·</span>
            <span className={`capitalize font-medium ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </span>
            <span aria-hidden="true">·</span>
            {linkedClient ? (
              <span className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-300 text-[10px] bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                <Building2 className="w-3 h-3 text-blue-500" />
                <span>{linkedClient.company}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-400 font-medium text-[10px] bg-neutral-50 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                <User className="w-3 h-3 text-indigo-500" />
                <span>Self Project</span>
              </span>
            )}
            {project.approvalStatus === 'pending' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] animate-pulse">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Pending Approval</span>
                </span>
              </>
            )}
            {project.approvalStatus === 'approved' && project.createdBy && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px]">
                  <Check className="w-2.5 h-2.5" />
                  <span>Approved</span>
                </span>
              </>
            )}
          </div>

          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-1 z-20 animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigateTo('project-detail', project.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openProjectModal(project.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Edit Project</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    requestDelete({
                      title: 'Delete Project?',
                      message: `Are you sure you want to permanently delete "${project.name}" and its associated tasks?`,
                      confirmLabel: 'Delete Project',
                      onConfirm: () => deleteProject(project.id),
                    });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Name */}
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-left leading-snug">
          {project.name}
        </h3>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Technical Resources & Plan Files Highlights */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {project.githubUrl && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[10px]">
              <Code2 className="w-3 h-3 text-neutral-500" />
              <span>GitHub</span>
            </span>
          )}

          {(project.databaseType || project.databaseUrl) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[10px]">
              <Database className="w-3 h-3 text-indigo-500" />
              <span className="truncate max-w-[120px]">
                {project.databaseType || 'Database'}
              </span>
            </span>
          )}

          {(project.publishUrl || project.liveUrl) && (
            <a
              href={project.publishUrl || project.liveUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors text-[10px] font-medium"
              title={`Published: ${project.publishUrl || project.liveUrl}`}
            >
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>Published</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          )}

          {planFilesCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px]">
              <FileText className="w-3 h-3 text-amber-500" />
              <span>{planFilesCount} plan files</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-neutral-150 dark:border-neutral-800/80 space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1 font-mono">
            <span className="text-neutral-500 text-[11px]">Progress</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {project.progress}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-0.5">
          <div className="flex items-center gap-2">
            <span>
              <strong className="text-neutral-900 dark:text-neutral-200">
                {completedTasks.length}/{projectTasks.length}
              </strong>{' '}
              tasks
            </span>
            <span>·</span>
            <span>{formatDuration(totalMinutes)}</span>
          </div>

          {project.deadline && (
            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <Calendar className="w-3 h-3" />
              <span>{project.deadline.slice(5)}</span>
            </div>
          )}
        </div>

        {/* Admin Quick Action for Pending Projects */}
        {isAdmin && project.approvalStatus === 'pending' && (
          <div
            className="pt-2 border-t border-amber-200 dark:border-amber-900/60 flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                const reason = window.prompt(
                  `Reason for rejecting "${project.name}":`,
                  'Project specifications require further detail or client verification.'
                );
                if (reason !== null) rejectProject(project.id, reason);
              }}
              className="flex-1 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-[11px] font-medium transition-colors cursor-pointer text-center"
            >
              Reject
            </button>
            <button
              onClick={() => approveProject(project.id)}
              className="flex-1 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Approve Project</span>
            </button>
          </div>
        )}

        {/* Click hint footer */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>View Project & Client Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

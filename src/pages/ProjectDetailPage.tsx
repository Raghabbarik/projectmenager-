import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckSquare,
  Milestone as MilestoneIcon,
  FolderGit2,
  Edit2,
  Trash2,
  Plus,
  Building2,
  User,
  KeyRound,
  FileText,
  Paperclip,
  Share2,
  ExternalLink,
  Database,
  Code2,
  Link2,
  Check,
  Download,
  Layers,
  ShieldCheck,
  Mail,
  Phone,
  FileCode2,
  Globe,
  X,
} from 'lucide-react';
import { KanbanBoard } from '../components/projects/KanbanBoard';
import { MilestoneTimeline } from '../components/projects/MilestoneTimeline';
import { ActivityCard, formatDuration } from '../components/activities/ActivityCard';
import { EmptyState } from '../components/common/EmptyState';

export const ProjectDetailPage: React.FC = () => {
  const {
    selectedProjectId,
    projects,
    tasks,
    milestones,
    activities,
    notes,
    files,
    clients,
    accounts,
    navigateTo,
    openProjectModal,
    openActivityModal,
    openNoteModal,
    updateProject,
    addProjectPlanFile,
    removeProjectPlanFile,
    requestDelete,
    deleteProject,
    showToast,
  } = useJourney();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'milestones' | 'activities' | 'notes' | 'files' | 'clients' | 'accounts'
  >('overview');

  const [showClientSelector, setShowClientSelector] = useState(false);
  const [selectedClientIdToConnect, setSelectedClientIdToConnect] = useState('');

  // Plan file creation drawer state
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanFileName, setNewPlanFileName] = useState('');
  const [newPlanFileType, setNewPlanFileType] = useState('PDF Architecture Spec');
  const [newPlanFileSize, setNewPlanFileSize] = useState('1.5 MB');
  const [newPlanFileUrl, setNewPlanFileUrl] = useState('');

  // Quick Publish URL modal state
  const [showPublishUrlModal, setShowPublishUrlModal] = useState(false);
  const [newPublishUrlInput, setNewPublishUrlInput] = useState('');

  const project = projects.find((p) => p.id === selectedProjectId) || projects[0];

  if (!project) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-neutral-500 mb-4">No project selected.</p>
        <button
          onClick={() => navigateTo('projects')}
          className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg cursor-pointer"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.status === 'completed');
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const projectActivities = activities.filter((a) => a.projectId === project.id);
  const totalMinutes = projectActivities.reduce((acc, a) => acc + a.durationMinutes, 0);

  const projectNotes = notes.filter((n) => n.linkedProjectId === project.id);
  const projectFiles = files.filter((f) => f.linkedProjectId === project.id);
  const linkedClient = clients.find((c) => c.id === project.clientId);
  const linkedAccount = accounts.find((a) => a.id === project.relatedAccountId);
  const projectPlanFiles = project.planFiles || [];

  const handleAddPlanFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanFileName.trim()) return;

    addProjectPlanFile(project.id, {
      name: newPlanFileName.trim(),
      type: newPlanFileType,
      size: newPlanFileSize.trim() || '1.2 MB',
      url: newPlanFileUrl.trim() || '#',
    });

    setNewPlanFileName('');
    setNewPlanFileUrl('');
    setShowAddPlanModal(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Details' },
    { id: 'tasks', label: `Tasks (${projectTasks.length})` },
    { id: 'milestones', label: `Milestones (${projectMilestones.length})` },
    { id: 'activities', label: `Activities (${projectActivities.length})` },
    { id: 'files', label: `Plan Files & Assets (${projectPlanFiles.length + projectFiles.length})` },
    { id: 'notes', label: `Notes (${projectNotes.length})` },
    { id: 'clients', label: linkedClient ? `Client: ${linkedClient.company}` : 'Client' },
    { id: 'accounts', label: 'Accounts' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Back button & Action Header */}
      <div>
        <button
          onClick={() => navigateTo('projects')}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5 flex-wrap">
              <span className="capitalize font-medium text-neutral-700 dark:text-neutral-300">
                {project.status.replace('_', ' ')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="capitalize text-rose-600 dark:text-rose-400 font-medium">
                {project.priority} Priority
              </span>
              <span aria-hidden="true">·</span>
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              {linkedClient ? (
                <button
                  onClick={() => navigateTo('client-detail', linkedClient.id)}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Client Project: {linkedClient.company}</span>
                </button>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-500" />
                  <span>Self Project</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
              {project.name}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 max-w-2xl leading-relaxed">
              {project.description}
            </p>

            {/* Technical Resources Quick Pill Bar */}
            <div className="flex items-center gap-2 mt-3 flex-wrap text-xs">
              {/* GitHub Link */}
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-mono text-[11px] transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ) : (
                <button
                  onClick={() => openProjectModal(project.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800 text-[11px] cursor-pointer"
                >
                  <Code2 className="w-3 h-3" />
                  <span>+ Add GitHub Link</span>
                </button>
              )}

              {/* Database Link / Badge */}
              {project.databaseUrl || project.databaseType ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 text-[11px]">
                  <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold">{project.databaseType || 'Database'}</span>
                  {project.databaseUrl && (
                    <span className="font-mono text-[10px] opacity-70 truncate max-w-[120px]">
                      {project.databaseUrl.replace(/^https?:\/\//, '').replace(/^postgresql:\/\/[^@]+@/, '')}
                    </span>
                  )}
                </span>
              ) : (
                <button
                  onClick={() => openProjectModal(project.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800 text-[11px] cursor-pointer"
                >
                  <Database className="w-3 h-3" />
                  <span>+ Add Database Specs</span>
                </button>
              )}

              {/* Publish URL / Live App URL */}
              {(project.publishUrl || project.liveUrl) ? (
                <div className="flex items-center gap-1">
                  <a
                    href={project.publishUrl || project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-[11px] font-semibold transition-colors shadow-2xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                    title={project.publishUrl || project.liveUrl}
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Published Site</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                  <button
                    onClick={() => {
                      setNewPublishUrlInput(project.publishUrl || project.liveUrl || '');
                      setShowPublishUrlModal(true);
                    }}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                    title="Edit Publish URL"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNewPublishUrlInput('');
                    setShowPublishUrlModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium cursor-pointer hover:bg-emerald-50/50 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Add Publish URL</span>
                </button>
              )}

              {/* Plan Files Count */}
              <button
                onClick={() => setActiveTab('files')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-[11px] hover:border-neutral-300 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>{projectPlanFiles.length} Plan Files</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => openActivityModal({ projectId: project.id, clientId: project.clientId })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>+ Log Project Time</span>
            </button>

            <button
              onClick={() => openProjectModal(project.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Project</span>
            </button>

            <button
              onClick={() =>
                requestDelete({
                  title: 'Delete Project?',
                  message: `Are you sure you want to remove "${project.name}"?`,
                  confirmLabel: 'Delete Project',
                  onConfirm: () => {
                    deleteProject(project.id);
                    navigateTo('projects');
                  },
                })
              }
              className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW & DETAILS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Progress & Quick Stats Card */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Project Completion Status
                </h3>
                <p className="text-xs text-neutral-500">
                  Target deadline: {project.deadline || 'No fixed deadline'} · Started: {project.startDate}
                </p>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {project.progress}% Done
              </div>
            </div>

            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-neutral-150 dark:border-neutral-800/80">
              <div>
                <div className="text-[11px] text-neutral-400">Time Invested</div>
                <div className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {formatDuration(totalMinutes)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Activities</div>
                <div className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {projectActivities.length} logs
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Tasks Done</div>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {completedTasks.length} / {projectTasks.length}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Milestones</div>
                <div className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {projectMilestones.filter((m) => m.status === 'completed').length} / {projectMilestones.length}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Plan Files</div>
                <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  {projectPlanFiles.length} files
                </div>
              </div>
            </div>
          </div>

          {/* 1. PROJECT PLAN & ARCHITECTURE FILES ("plane files") */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-150 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Project Plan & Architecture Documentation Files</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Specifications, blueprints, wireframes, and SOW documents stored for this project
                </p>
              </div>

              <button
                onClick={() => setShowAddPlanModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Attach Plan File</span>
              </button>
            </div>

            {/* Plan Details Summary */}
            {project.planDetails && (
              <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <span className="font-semibold block text-neutral-900 dark:text-neutral-100 mb-1">
                  Architecture & Execution Plan Overview:
                </span>
                {project.planDetails}
              </div>
            )}

            {/* Plan Files Grid */}
            {projectPlanFiles.length === 0 ? (
              <div className="p-6 text-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400 space-y-2">
                <p>No plan files attached to this project yet.</p>
                <button
                  onClick={() => setShowAddPlanModal(true)}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + Upload or Attach Plan Document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projectPlanFiles.map((planFile) => (
                  <div
                    key={planFile.id}
                    className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                        <FileCode2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate" title={planFile.name}>
                          {planFile.name}
                        </h4>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-sans">
                            {planFile.type}
                          </span>
                          <span>{planFile.size || '1.0 MB'}</span>
                          <span>·</span>
                          <span>{planFile.addedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-150 dark:border-neutral-800/80 text-[11px]">
                      <a
                        href={planFile.url || '#'}
                        onClick={(e) => {
                          if (planFile.url === '#') {
                            e.preventDefault();
                            showToast(`Opening plan file: ${planFile.name}`, 'info');
                          }
                        }}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>View / Open File</span>
                      </a>

                      <button
                        onClick={() => removeProjectPlanFile(project.id, planFile.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove plan file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. GITHUB & DATABASE DETAILS CARD */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-150 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span>Technical Infrastructure: GitHub & Database Details</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Source code repository, database cluster configuration, and endpoints
                </p>
              </div>

              <button
                onClick={() => openProjectModal(project.id)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Edit Specs
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Published URL Details */}
              <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Publish URL (Live Site)</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      project.publishUrl || project.liveUrl
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {project.publishUrl || project.liveUrl ? 'Live' : 'Draft'}
                  </span>
                </div>

                <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300 break-all bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  {project.publishUrl || project.liveUrl || 'No publish URL configured'}
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => {
                      setNewPublishUrlInput(project.publishUrl || project.liveUrl || '');
                      setShowPublishUrlModal(true);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer text-xs"
                  >
                    {project.publishUrl || project.liveUrl ? 'Edit Publish URL' : '+ Add Publish URL'}
                  </button>

                  {(project.publishUrl || project.liveUrl) && (
                    <a
                      href={project.publishUrl || project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Visit Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* GitHub Details */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/30 dark:bg-neutral-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    <Code2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    <span>GitHub Repository</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    Active
                  </span>
                </div>

                <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300 break-all bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  {project.githubUrl || 'No GitHub link configured'}
                </div>

                {project.githubUrl && (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-neutral-500 text-[11px]">Primary branch: main</span>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Open on GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Database Details */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/30 dark:bg-neutral-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    <Database className="w-4 h-4 text-indigo-500" />
                    <span>Database Engine & Endpoint</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                    {project.databaseType || 'PostgreSQL'}
                  </span>
                </div>

                <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300 break-all bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  {project.databaseUrl || 'No database link configured'}
                </div>

                {project.databaseNotes && (
                  <p className="text-[11px] text-neutral-500 italic mt-1 leading-relaxed">
                    &ldquo;{project.databaseNotes}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. CONNECTED CLIENT DETAILS CARD (All client details right in the project) */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-150 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <span>Client & Stakeholder Details</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Contract ownership, stakeholder contacts, and logged billing time
                </p>
              </div>

              {linkedClient && (
                <button
                  onClick={() => navigateTo('client-detail', linkedClient.id)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  View Full Dossier →
                </button>
              )}
            </div>

            {linkedClient ? (
              <div className="p-4 rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-950/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                      {linkedClient.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {linkedClient.company}
                      </h4>
                      <p className="text-xs text-neutral-500">Contact: {linkedClient.name}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 self-start sm:self-auto">
                    Contract Deliverable
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-neutral-400 block">Direct Email</span>
                    <a href={`mailto:${linkedClient.email}`} className="font-mono text-neutral-900 dark:text-neutral-100 hover:underline flex items-center gap-1">
                      <Mail className="w-3 h-3 text-neutral-400" />
                      <span>{linkedClient.email}</span>
                    </a>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-neutral-400 block">Direct Phone</span>
                    <a href={`tel:${linkedClient.phone}`} className="font-mono text-neutral-900 dark:text-neutral-100 hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <span>{linkedClient.phone}</span>
                    </a>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-neutral-400 block">Time Tracked on this Project</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                      {formatDuration(totalMinutes)} ({projectActivities.length} logs)
                    </span>
                  </div>
                </div>

                {linkedClient.notes && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 italic bg-white/70 dark:bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800">
                    &ldquo;{linkedClient.notes}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                    Self Project (Personal / Internal Initiative)
                  </span>
                  <p className="text-neutral-500 mt-0.5">
                    No external client assigned. You can connect a client anytime if this becomes a contract project.
                  </p>
                </div>
                <button
                  onClick={() => setShowClientSelector(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  + Connect to Client
                </button>
              </div>
            )}
          </div>

          {/* Recent Activities for this Project */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Activity on This Project
              </h3>
              <button
                onClick={() =>
                  openActivityModal({ projectId: project.id, clientId: project.clientId, date: '2026-09-28' })
                }
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                + Log Project Activity
              </button>
            </div>

            {projectActivities.length === 0 ? (
              <EmptyState
                title="No activities logged on this project yet"
                description="Keep track of time spent coding, debugging, or reviewing."
                actionLabel="Log Time"
                onAction={() => openActivityModal({ projectId: project.id, clientId: project.clientId })}
              />
            ) : (
              <div className="space-y-2.5">
                {projectActivities.slice(0, 3).map((act) => (
                  <ActivityCard key={act.id} activity={act} showDate={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: TASKS (Kanban Board) */}
      {activeTab === 'tasks' && <KanbanBoard projectId={project.id} />}

      {/* Tab: MILESTONES (Timeline) */}
      {activeTab === 'milestones' && <MilestoneTimeline projectId={project.id} />}

      {/* Tab: ACTIVITIES (All connected activities) */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              All Activity Entries ({projectActivities.length})
            </h3>
            <button
              onClick={() => openActivityModal({ projectId: project.id, clientId: project.clientId })}
              className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              + Log Activity
            </button>
          </div>

          {projectActivities.length === 0 ? (
            <EmptyState
              title="No activities recorded"
              description="Record your progress sessions to calculate accurate velocity."
            />
          ) : (
            <div className="space-y-2.5">
              {projectActivities.map((act) => (
                <ActivityCard key={act.id} activity={act} showDate={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Project Notes & Technical Docs
            </h3>
            <button
              onClick={() => openNoteModal()}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              + Add Note
            </button>
          </div>

          {projectNotes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notes linked to this project"
              description="Store technical specs, architecture decisions, or meeting notes."
              actionLabel="Write Note"
              onAction={() => openNoteModal()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-2"
                >
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {note.title}
                  </h4>
                  <pre className="text-xs text-neutral-600 dark:text-neutral-400 font-sans whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {note.content}
                  </pre>
                  {note.tags && note.tags.length > 0 && (
                    <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      {note.tags.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: FILES (Plan Files + Attachments) */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {/* Plan Files Section ("plane files") */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Project Plan & Architecture Files ({projectPlanFiles.length})</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Core blueprints, planning docs, specifications, and architecture diagrams
                </p>
              </div>

              <button
                onClick={() => setShowAddPlanModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Attach Plan File</span>
              </button>
            </div>

            {projectPlanFiles.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
                No plan files attached. Click &ldquo;+ Attach Plan File&rdquo; to add specification PDFs or wireframes.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projectPlanFiles.map((pf) => (
                  <div
                    key={pf.id}
                    className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                        <FileCode2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {pf.name}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          {pf.type} · {pf.size || '1.0 MB'} · {pf.addedAt}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeProjectPlanFile(project.id, pf.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer ml-2"
                      title="Delete plan file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* General Project Assets & Uploads */}
          <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              General Files & Assets ({projectFiles.length})
            </h3>
            {projectFiles.length === 0 ? (
              <EmptyState
                icon={Paperclip}
                title="No additional files attached"
                description="Upload images, screenshots, and export archives."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projectFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs"
                  >
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        {file.size} · {file.uploadedAt.slice(0, 10)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: CLIENTS */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Associated Client
              </h3>
              <p className="text-xs text-neutral-500">
                Specify if this project is for an external client or your own initiative
              </p>
            </div>

            <button
              onClick={() => setShowClientSelector(!showClientSelector)}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {showClientSelector ? 'Cancel' : linkedClient ? 'Change Client' : '+ Connect to a Client'}
            </button>
          </div>

          {/* Quick Client Connector / Changer Drawer */}
          {showClientSelector && (
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3 max-w-lg animate-in fade-in duration-150">
              <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {linkedClient ? 'Reassign Project to Different Client' : 'Connect Project to Client'}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={selectedClientIdToConnect}
                  onChange={(e) => setSelectedClientIdToConnect(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={!selectedClientIdToConnect}
                  onClick={() => {
                    updateProject(project.id, { clientId: selectedClientIdToConnect });
                    const targetClient = clients.find((c) => c.id === selectedClientIdToConnect);
                    showToast(`Project connected to "${targetClient?.company}"!`, 'success');
                    setShowClientSelector(false);
                    setSelectedClientIdToConnect('');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer transition-colors shadow-xs"
                >
                  Connect
                </button>
              </div>

              {linkedClient && (
                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      updateProject(project.id, { clientId: undefined });
                      showToast(`Project unlinked from ${linkedClient.company}. Now a Self Project!`, 'info');
                      setShowClientSelector(false);
                    }}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Unlink from Client (Convert to Self Project)
                  </button>
                </div>
              )}
            </div>
          )}

          {linkedClient ? (
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs max-w-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {linkedClient.company}
                  </h4>
                  <p className="text-xs text-neutral-500">Contact: {linkedClient.name}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                  Client Deliverable
                </span>
              </div>

              <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div>Email: {linkedClient.email || 'None'}</div>
                <div>Phone: {linkedClient.phone || 'None'}</div>
                {linkedClient.notes && <div className="italic">&ldquo;{linkedClient.notes}&rdquo;</div>}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => openActivityModal({ projectId: project.id, clientId: linkedClient.id })}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                >
                  + Log Time for this Client
                </button>
                <button
                  onClick={() => navigateTo('client-detail', linkedClient.id)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                >
                  View Client Dossier →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 max-w-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <User className="w-4 h-4 text-indigo-500" />
                <span>Self Project (Internal / Personal)</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                This project is currently marked as an internal or personal initiative. You can connect it to a client anytime if it becomes a client deliverable.
              </p>
              <button
                onClick={() => setShowClientSelector(true)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 cursor-pointer shadow-xs"
              >
                + Connect to a Client
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Connected Service Accounts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {accounts
              .filter((acc) => (acc.linkedProjectIds || []).includes(project.id))
              .map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs"
                >
                  <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {acc.service}
                    </h4>
                    <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                      {acc.email}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      {acc.purpose}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL: ATTACH PLAN FILE ("plane files") */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Attach Project Plan File
                </h3>
                <p className="text-xs text-neutral-500">
                  Upload or link architecture specs, blueprints, and SOW documents
                </p>
              </div>
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlanFileSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Plan File Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. system_architecture_spec_v2.pdf"
                  value={newPlanFileName}
                  onChange={(e) => setNewPlanFileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Document Type
                  </label>
                  <select
                    value={newPlanFileType}
                    onChange={(e) => setNewPlanFileType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="PDF Architecture Spec">PDF Architecture Spec</option>
                    <option value="Wireframe / Design Blueprint">Wireframe / Blueprint</option>
                    <option value="Database ERD Schema">Database Schema</option>
                    <option value="Statement of Work (SOW)">Statement of Work (SOW)</option>
                    <option value="Sprint Delivery Plan">Sprint Delivery Plan</option>
                    <option value="Technical Brief">Technical Brief</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    File Size (approx)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2.4 MB"
                    value={newPlanFileSize}
                    onChange={(e) => setNewPlanFileSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  External URL / Storage Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or Figma link"
                  value={newPlanFileUrl}
                  onChange={(e) => setNewPlanFileUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-150 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="px-3.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                >
                  Attach File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Quick Add/Edit Publish URL Modal */}
      {showPublishUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {project.publishUrl || project.liveUrl ? 'Edit Publish URL' : 'Add Publish URL'}
                </h3>
              </div>
              <button
                onClick={() => setShowPublishUrlModal(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const url = newPublishUrlInput.trim();
                updateProject(project.id, {
                  publishUrl: url || undefined,
                  liveUrl: url || undefined,
                });
                showToast(url ? 'Publish URL updated successfully!' : 'Publish URL removed.', 'success');
                setShowPublishUrlModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Public Published / Live URL
                </label>
                <input
                  type="url"
                  placeholder="https://myproject.app or https://app.example.com"
                  value={newPublishUrlInput}
                  onChange={(e) => setNewPublishUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Enter the public web address where this project is deployed and live for users to visit.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowPublishUrlModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  Save Publish URL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

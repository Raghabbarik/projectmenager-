import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Edit2,
  Trash2,
  FolderGit2,
  Clock,
  Plus,
  Link2,
  Check,
  Unlink,
} from 'lucide-react';
import { ActivityCard } from '../components/activities/ActivityCard';
import { ProjectCard } from '../components/projects/ProjectCard';
import { EmptyState } from '../components/common/EmptyState';

export const ClientDetailPage: React.FC = () => {
  const {
    selectedClientId,
    clients,
    projects,
    activities,
    openClientModal,
    openProjectModal,
    openActivityModal,
    updateProject,
    requestDelete,
    deleteClient,
    navigateTo,
    showToast,
  } = useJourney();

  const [showConnectExisting, setShowConnectExisting] = useState(false);
  const [selectedProjectIdToConnect, setSelectedProjectIdToConnect] = useState('');

  const client = clients.find((c) => c.id === selectedClientId) || clients[0];

  if (!client) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-neutral-500 mb-4">No client selected.</p>
        <button
          onClick={() => navigateTo('clients')}
          className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg cursor-pointer"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  const clientProjects = projects.filter((p) => p.clientId === client.id);
  const clientActivities = activities.filter((a) => a.clientId === client.id);
  const totalClientMinutes = clientActivities.reduce((acc, a) => acc + a.durationMinutes, 0);

  // Projects not currently connected to this client
  const availableProjectsToConnect = projects.filter((p) => p.clientId !== client.id);

  const handleConnectProject = (projectId: string) => {
    if (!projectId) return;
    updateProject(projectId, { clientId: client.id });
    const p = projects.find((x) => x.id === projectId);
    showToast(`Connected "${p?.name || 'Project'}" to ${client.company}!`, 'success');
    setSelectedProjectIdToConnect('');
    setShowConnectExisting(false);
  };

  const handleDisconnectProject = (projectId: string) => {
    const p = projects.find((x) => x.id === projectId);
    updateProject(projectId, { clientId: undefined });
    showToast(`Unlinked "${p?.name || 'Project'}" from ${client.company}. Now a Self Project.`, 'info');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <button
        onClick={() => navigateTo('clients')}
        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-2 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Clients</span>
      </button>

      {/* Header Card */}
      <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
            {client.company.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {client.company}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                Client Dossier
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">Primary Contact: {client.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openActivityModal({ clientId: client.id })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>+ Log Project Time</span>
          </button>

          <button
            onClick={() => openProjectModal(undefined, undefined, client.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => openClientModal(client.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() =>
              requestDelete({
                title: 'Delete Client?',
                message: `Are you sure you want to remove "${client.company}"? Associated projects will remain as self projects.`,
                confirmLabel: 'Delete Client',
                onConfirm: () => {
                  deleteClient(client.id);
                  navigateTo('clients');
                },
              })
            }
            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
            title="Delete Client"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-1">
          <div className="text-[11px] text-neutral-400">Direct Email</div>
          <div className="text-xs font-mono text-neutral-900 dark:text-neutral-100 font-semibold truncate">
            {client.email || 'None specified'}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-1">
          <div className="text-[11px] text-neutral-400">Phone Contact</div>
          <div className="text-xs font-mono text-neutral-900 dark:text-neutral-100 font-semibold truncate">
            {client.phone || 'None specified'}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-1">
          <div className="text-[11px] text-neutral-400">Connected Projects</div>
          <div className="text-xs font-mono text-neutral-900 dark:text-neutral-100 font-semibold">
            {clientProjects.length} Projects
          </div>
        </div>
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-1">
          <div className="text-[11px] text-neutral-400">Tracked Work Time</div>
          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
            {Math.floor(totalClientMinutes / 60)}h {totalClientMinutes % 60}m ({clientActivities.length} logs)
          </div>
        </div>
      </div>

      {client.notes && (
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
          &ldquo;{client.notes}&rdquo;
        </div>
      )}

      {/* Linked Projects Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Associated Projects ({clientProjects.length})
            </h2>
            <p className="text-xs text-neutral-500">
              All client projects connected to {client.company}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConnectExisting(!showConnectExisting)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showConnectExisting ? 'Close Connector' : 'Connect Existing Project'}</span>
            </button>

            <button
              onClick={() => openProjectModal(undefined, undefined, client.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Project for Client</span>
            </button>
          </div>
        </div>

        {/* Connect Existing Project Dropdown Drawer */}
        {showConnectExisting && (
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Connect an Existing Project to {client.company}
              </div>
              <span className="text-[11px] text-neutral-500">
                Select from your self projects or reassign
              </span>
            </div>

            {availableProjectsToConnect.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">
                All existing projects are already connected to this client.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={selectedProjectIdToConnect}
                  onChange={(e) => setSelectedProjectIdToConnect(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                >
                  <option value="">-- Choose Project to Connect to {client.company} --</option>
                  {availableProjectsToConnect.map((p) => {
                    const currentClient = clients.find((c) => c.id === p.clientId);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} {currentClient ? `(Currently: ${currentClient.company})` : '(Self Project)'}
                      </option>
                    );
                  })}
                </select>

                <button
                  type="button"
                  disabled={!selectedProjectIdToConnect}
                  onClick={() => handleConnectProject(selectedProjectIdToConnect)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer transition-colors shadow-xs"
                >
                  Connect to Client
                </button>
              </div>
            )}
          </div>
        )}

        {/* Projects Grid */}
        {clientProjects.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 mx-auto flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                No projects connected yet
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                You can create a new project for {client.company} or connect any existing project.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowConnectExisting(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 cursor-pointer"
              >
                Connect Existing Project
              </button>
              <button
                onClick={() => openProjectModal(undefined, undefined, client.id)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
              >
                + Create New Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientProjects.map((p) => (
              <div key={p.id} className="relative flex flex-col justify-between">
                <ProjectCard project={p} />
                <div className="mt-1 flex items-center justify-between px-2 text-xs">
                  <button
                    onClick={() => openActivityModal({ projectId: p.id, clientId: client.id })}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    <Clock className="w-3 h-3" />
                    <span>+ Log Time on this Project</span>
                  </button>

                  <button
                    onClick={() => handleDisconnectProject(p.id)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                    title="Disconnect from client (converts to Self Project)"
                  >
                    <Unlink className="w-3 h-3" />
                    <span>Unlink</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked Activities */}
      <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Recorded Work & Activities ({clientActivities.length})
            </h2>
            <p className="text-xs text-neutral-500">
              Total logged: {Math.floor(totalClientMinutes / 60)}h {totalClientMinutes % 60}m
            </p>
          </div>
          <button
            onClick={() => openActivityModal({ clientId: client.id })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Time for {client.company}</span>
          </button>
        </div>

        {clientActivities.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No activities recorded yet"
            description="Log meetings, reviews, or design deliverables for this client."
            actionLabel="+ Log First Activity"
            onAction={() => openActivityModal({ clientId: client.id })}
          />
        ) : (
          <div className="space-y-2.5">
            {clientActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} showDate={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

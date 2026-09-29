import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  Building2,
  Plus,
  Mail,
  Phone,
  FolderGit2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  Search,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const ClientsPage: React.FC = () => {
  const {
    clients,
    visibleClients,
    isMember,
    isAdmin,
    projects,
    activities,
    openClientModal,
    openProjectModal,
    openActivityModal,
    requestDelete,
    deleteClient,
    approveClient,
    rejectClient,
    navigateTo,
  } = useJourney();

  const [search, setSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<'all' | 'approved' | 'pending'>('all');

  const baseClients = isMember ? visibleClients : clients;

  const pendingClients = baseClients.filter(
    (c) => c.approvalStatus === 'pending'
  );

  const filteredClients = baseClients.filter((c) => {
    // Status tab filter
    if (statusTab === 'approved' && c.approvalStatus === 'pending') return false;
    if (statusTab === 'pending' && c.approvalStatus !== 'pending') return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.company.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const handleRejectPrompt = (id: string, company: string) => {
    const reason = window.prompt(
      `Please provide feedback/reason for rejecting client "${company}":`,
      'Missing contract details or unverified company domain.'
    );
    if (reason !== null) {
      rejectClient(id, reason);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Member Allocation Notice */}
      {isMember && (
        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300">
          <div>
            <span className="font-semibold block sm:inline mr-1">Client Workspace:</span>
            <span>You have access to {visibleClients.length} allocated & submitted client(s). You can create new clients to submit for Admin approval.</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold uppercase shrink-0">
            Member Access
          </span>
        </div>
      )}

      {/* Admin Pending Approvals Alert Section */}
      {isAdmin && pendingClients.length > 0 && (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/70 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Pending Client Submissions ({pendingClients.length})
                </h3>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Review and approve clients submitted by team members before they are officially active.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingClients.map((client) => (
              <div
                key={client.id}
                className="p-3.5 rounded-lg bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                        {client.company}
                      </h4>
                      <p className="text-[11px] text-neutral-500">{client.name} · {client.email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Pending
                    </span>
                  </div>

                  {client.createdByName && (
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                      Submitted by: <strong className="text-neutral-900 dark:text-neutral-200">{client.createdByName}</strong>
                    </div>
                  )}

                  {client.notes && (
                    <p className="text-[11px] text-neutral-500 italic mt-1.5 line-clamp-2">
                      &ldquo;{client.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => handleRejectPrompt(client.id, client.company)}
                    className="flex items-center gap-1 px-3 py-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => approveClient(client.id)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Client</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {isMember ? 'My Clients & Submissions' : 'Clients & Stakeholders'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isMember
              ? 'View contract relationships, connect projects, and submit new clients'
              : 'Manage corporate contacts, contract relationships, and approve member submissions'}
          </p>
        </div>

        <button
          onClick={() => openClientModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-[#e5e5cb] dark:text-[#1a120b] hover:bg-neutral-800 dark:hover:bg-[#d5cea3] transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isMember ? 'Submit New Client' : 'Add Client'}</span>
        </button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              statusTab === 'all'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            All Clients ({baseClients.length})
          </button>
          <button
            onClick={() => setStatusTab('approved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              statusTab === 'approved'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Approved ({baseClients.filter((c) => c.approvalStatus !== 'pending').length})
          </button>
          <button
            onClick={() => setStatusTab('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusTab === 'pending'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <span>Pending Approval</span>
            {pendingClients.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingClients.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Client Cards Grid */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients found"
          description={
            statusTab === 'pending'
              ? 'No client submissions are pending approval.'
              : 'Track external partners, agencies, or client projects.'
          }
          actionLabel={isMember ? 'Submit New Client' : 'Add Client'}
          onAction={() => openClientModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const clientProjects = projects.filter((p) => p.clientId === client.id);
            const clientActivities = activities.filter((a) => a.clientId === client.id);
            const isPending = client.approvalStatus === 'pending';
            const isRejected = client.approvalStatus === 'rejected';

            return (
              <div
                key={client.id}
                className={`group relative p-5 rounded-xl border transition-all shadow-xs flex flex-col justify-between ${
                  isPending
                    ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : isRejected
                    ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {client.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {client.company}
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-500">{client.name}</p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === client.id ? null : client.id)
                        }
                        className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === client.id && (
                        <div className="absolute right-0 mt-1 w-32 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-1 z-20">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              openClientModal(client.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              requestDelete({
                                title: 'Delete Client?',
                                message: `Are you sure you want to remove "${client.company}"?`,
                                confirmLabel: 'Delete Client',
                                onConfirm: () => deleteClient(client.id),
                              });
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="mb-2.5 flex items-center gap-1.5 flex-wrap">
                    {isPending ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                        <Clock className="w-3 h-3" />
                        Pending Approval
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        <AlertCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <Check className="w-3 h-3" />
                        Approved
                      </span>
                    )}

                    {client.createdByName && (
                      <span className="text-[10px] text-neutral-400">
                        by {client.createdByName}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 my-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  {client.notes && (
                    <p className="text-[11px] text-neutral-500 italic line-clamp-2 mt-2">
                      &ldquo;{client.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3.5 border-t border-neutral-150 dark:border-neutral-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-[11px] font-mono text-neutral-500">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {clientProjects.length}
                      </span>{' '}
                      projects ·{' '}
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {clientActivities.length}
                      </span>{' '}
                      logs
                    </div>

                    <button
                      onClick={() => navigateTo('client-detail', client.id)}
                      className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer text-xs"
                    >
                      <span>Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Admin Fast Approval Buttons on Pending Card */}
                  {isAdmin && isPending ? (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
                      <button
                        onClick={() => handleRejectPrompt(client.id, client.company)}
                        className="flex-1 py-1 px-2 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-[11px] font-medium text-center transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => approveClient(client.id)}
                        className="flex-1 py-1 px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold text-center transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                    </div>
                  ) : (
                    /* Fast Action Buttons: Connect Project and Log Time */
                    <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
                      <button
                        onClick={() => openProjectModal(undefined, undefined, client.id)}
                        className="flex-1 py-1 px-2 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-[11px] font-medium text-center transition-colors cursor-pointer"
                      >
                        + Connect Project
                      </button>
                      <button
                        onClick={() => openActivityModal({ clientId: client.id })}
                        className="flex-1 py-1 px-2 rounded-md bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold text-center transition-colors cursor-pointer"
                      >
                        + Log Time
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

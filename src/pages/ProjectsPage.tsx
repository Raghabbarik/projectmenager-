import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import { ProjectStatus, PriorityLevel } from '../types';
import {
  Plus,
  LayoutGrid,
  List as ListIcon,
  Search,
  Filter,
  FolderGit2,
  Clock,
  Check,
  X,
  Building2,
} from 'lucide-react';
import { ProjectCard } from '../components/projects/ProjectCard';
import { EmptyState } from '../components/common/EmptyState';

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    visibleProjects,
    isMember,
    isAdmin,
    openProjectModal,
    clients,
    visibleClients,
    approveProject,
    rejectProject,
  } = useJourney();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'self' | 'client'>('all');
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const baseProjects = isMember ? visibleProjects : projects;

  const pendingProjects = baseProjects.filter((p) => p.approvalStatus === 'pending');

  const statusTabs: { id: string; label: string; count?: number }[] = [
    { id: 'all', label: isMember ? 'All Client Projects' : 'All Projects' },
    {
      id: 'pending',
      label: 'Pending Approval',
      count: pendingProjects.length,
    },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'planning', label: 'Planning' },
    { id: 'on_hold', label: 'On Hold' },
    { id: 'completed', label: 'Completed' },
    { id: 'archived', label: 'Archived' },
  ];

  const filteredProjects = baseProjects.filter((p) => {
    // If Admin chooses ownership filter
    if (!isMember) {
      if (ownershipFilter === 'self' && !!p.clientId && p.clientId !== 'self') return false;
      if (ownershipFilter === 'client' && (!p.clientId || p.clientId === 'self')) return false;
    }

    if (statusFilter === 'pending') {
      if (p.approvalStatus !== 'pending') return false;
    } else if (statusFilter !== 'all') {
      if (p.status !== statusFilter) return false;
    }

    if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
    if (clientFilter !== 'all' && p.clientId !== clientFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchCategory && !matchTags) return false;
    }
    return true;
  });

  const handleRejectPrompt = (id: string, projectName: string) => {
    const reason = window.prompt(
      `Please provide feedback/reason for rejecting project "${projectName}":`,
      'Project requirements require additional client verification or details.'
    );
    if (reason !== null) {
      rejectProject(id, reason);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Member Allocation Notice */}
      {isMember && (
        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300">
          <div>
            <span className="font-semibold block sm:inline mr-1">Client Project Deliverables:</span>
            <span>You have access to {visibleProjects.length} project deliverable(s). You can create deliverables and connect them to allocated clients for Admin approval.</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold uppercase shrink-0">
            Member Access
          </span>
        </div>
      )}

      {/* Admin Pending Approvals Alert Section */}
      {isAdmin && pendingProjects.length > 0 && (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/70 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Pending Project Submissions ({pendingProjects.length})
              </h3>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Member-submitted deliverables pending your review and authorization.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingProjects.map((p) => {
              const connectedClient = clients.find((c) => c.id === p.clientId);
              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-lg bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                          <span>{p.category}</span>
                          {connectedClient && (
                            <span className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-300">
                              <Building2 className="w-3 h-3 text-blue-500" />
                              <span>{connectedClient.company}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
                        Pending
                      </span>
                    </div>

                    {p.createdByName && (
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                        Submitted by: <strong className="text-neutral-900 dark:text-neutral-200">{p.createdByName}</strong>
                      </div>
                    )}

                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() => handleRejectPrompt(p.id, p.name)}
                      className="flex items-center gap-1 px-3 py-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => approveProject(p.id)}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Project</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {isMember ? 'Client Projects' : 'Projects'}
            </h1>
            {isMember && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Member View
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isMember
              ? 'Viewing deliverables, specs, and status for client-associated projects'
              : 'Manage everything you are building, designing, and delivering'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Ownership Toggle (for Admin) */}
          {!isMember && (
            <div className="flex items-center p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 text-xs">
              <button
                onClick={() => setOwnershipFilter('all')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  ownershipFilter === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setOwnershipFilter('self')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  ownershipFilter === 'self'
                    ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Self Projects
              </button>
              <button
                onClick={() => setOwnershipFilter('client')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  ownershipFilter === 'client'
                    ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Client Projects
              </button>
            </div>
          )}

          {/* Grid/List Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                layout === 'grid'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                layout === 'list'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => openProjectModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-[#e5e5cb] dark:text-[#1a120b] hover:bg-neutral-800 dark:hover:bg-[#d5cea3] transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isMember ? 'Submit New Project' : 'New Project'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                    : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Secondary Filter Dropdowns */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Client Filter Dropdown */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Clients</option>
            {(isMember ? visibleClients : clients).map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Projects List/Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects found"
          description={
            statusFilter === 'pending'
              ? 'No project submissions are currently pending approval.'
              : search
              ? `No projects matching "${search}".`
              : 'Get started by creating your first project.'
          }
          actionLabel={isMember ? 'Submit New Project' : 'New Project'}
          onAction={() => openProjectModal()}
        />
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} layout="list" />
          ))}
        </div>
      )}
    </div>
  );
};

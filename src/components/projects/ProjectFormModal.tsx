import React, { useState, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { Project, ProjectStatus, PriorityLevel } from '../../types';
import { X, Building2, User, Plus, Check, Code2, Database, Globe, FileText, Clock } from 'lucide-react';

export const ProjectFormModal: React.FC = () => {
  const {
    projectModal,
    closeProjectModal,
    addProject,
    updateProject,
    updateIdea,
    clients,
    visibleClients,
    isMember,
    addClient,
    accounts,
    projects,
    showToast,
  } = useJourney();

  const [projectType, setProjectType] = useState<'self' | 'client'>('self');
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('in_progress');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [startDate, setStartDate] = useState(getTodayDate);
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState(0);
  const [clientId, setClientId] = useState('');
  const [relatedAccountId, setRelatedAccountId] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Technical Resources & Plan Details
  const [githubUrl, setGithubUrl] = useState('');
  const [databaseType, setDatabaseType] = useState('PostgreSQL (Cloud SQL)');
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [databaseNotes, setDatabaseNotes] = useState('');
  const [publishUrl, setPublishUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [planDetails, setPlanDetails] = useState('');

  // Quick inline client addition state
  const [showQuickAddClient, setShowQuickAddClient] = useState(false);
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  useEffect(() => {
    if (projectModal.isOpen) {
      setShowQuickAddClient(false);
      setNewClientCompany('');
      setNewClientName('');
      setNewClientEmail('');

      if (projectModal.editId) {
        const p = projects.find((x) => x.id === projectModal.editId);
        if (p) {
          setName(p.name);
          setDescription(p.description);
          setCategory(p.category);
          setStatus(p.status);
          setPriority(p.priority);
          setStartDate(p.startDate);
          setDeadline(p.deadline || '');
          setProgress(p.progress);
          setClientId(p.clientId || '');
          setProjectType(p.clientId ? 'client' : 'self');
          setRelatedAccountId(p.relatedAccountId || '');
          setTagInput((p.tags || []).join(', '));
          setGithubUrl(p.githubUrl || '');
          setDatabaseType(p.databaseType || 'PostgreSQL (Cloud SQL)');
          setDatabaseUrl(p.databaseUrl || '');
          setDatabaseNotes(p.databaseNotes || '');
          setPublishUrl(p.publishUrl || p.liveUrl || '');
          setLiveUrl(p.publishUrl || p.liveUrl || '');
          setPlanDetails(p.planDetails || '');
        }
      } else if (projectModal.prefillClientId) {
        setName('');
        setDescription('');
        setCategory('Client Deliverables');
        setStatus('in_progress');
        setPriority('high');
        setStartDate(getTodayDate());
        setDeadline('');
        setProgress(0);
        setProjectType('client');
        setClientId(projectModal.prefillClientId);
        setRelatedAccountId('');
        setTagInput('');
        setGithubUrl('');
        setDatabaseType('PostgreSQL (Cloud SQL)');
        setDatabaseUrl('');
        setDatabaseNotes('');
        setPublishUrl('');
        setLiveUrl('');
        setPlanDetails('');
      } else if (projectModal.prefillFromIdea) {
        const idea = projectModal.prefillFromIdea;
        setName(idea.title);
        setDescription(idea.description);
        setCategory(idea.category);
        setStatus('in_progress');
        setPriority(idea.priority);
        setStartDate(getTodayDate());
        setDeadline('2026-11-15');
        setProgress(10);
        setProjectType('self');
        setClientId('');
        setRelatedAccountId('');
        setTagInput((idea.tags || []).join(', '));
        setGithubUrl('');
        setDatabaseType('PostgreSQL (Cloud SQL)');
        setDatabaseUrl('');
        setDatabaseNotes('');
        setPublishUrl('');
        setLiveUrl('');
        setPlanDetails(idea.description);
      } else {
        setName('');
        setDescription('');
        setCategory(isMember ? 'Client Deliverables' : 'Engineering & Tools');
        setStatus('in_progress');
        setPriority('high');
        setStartDate(getTodayDate());
        setDeadline('');
        setProgress(0);
        setProjectType(isMember ? 'client' : 'self');
        setClientId(isMember && visibleClients.length > 0 ? visibleClients[0].id : '');
        setRelatedAccountId('');
        setTagInput('');
        setGithubUrl('');
        setDatabaseType('PostgreSQL (Cloud SQL)');
        setDatabaseUrl('');
        setDatabaseNotes('');
        setPublishUrl('');
        setLiveUrl('');
        setPlanDetails('');
      }
    }
  }, [projectModal, projects, isMember, visibleClients]);

  if (!projectModal.isOpen) return null;

  const handleCreateQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientCompany.trim()) return;

    const created = addClient({
      company: newClientCompany.trim(),
      name: newClientName.trim() || newClientCompany.trim(),
      email: newClientEmail.trim() || `contact@${newClientCompany.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: '+1 555-0100',
    });

    setClientId(created.id);
    setShowQuickAddClient(false);
    setNewClientCompany('');
    setNewClientName('');
    setNewClientEmail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (projectType === 'client' && !clientId) {
      showToast('Please select or add a client for this Client Project, or switch to Self Project.', 'warning');
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || (projectType === 'client' ? 'Client Work' : 'Personal Project'),
      status,
      priority,
      startDate,
      deadline: deadline || undefined,
      progress: Number(progress) || 0,
      clientId: projectType === 'client' ? clientId : undefined,
      relatedAccountId: relatedAccountId || undefined,
      tags,
      githubUrl: githubUrl.trim() || undefined,
      databaseType: databaseType.trim() || undefined,
      databaseUrl: databaseUrl.trim() || undefined,
      databaseNotes: databaseNotes.trim() || undefined,
      publishUrl: (publishUrl || liveUrl).trim() || undefined,
      liveUrl: (publishUrl || liveUrl).trim() || undefined,
      planDetails: planDetails.trim() || undefined,
    };

    if (projectModal.editId) {
      updateProject(projectModal.editId, payload);
    } else {
      const created = addProject(payload);
      if (projectModal.prefillFromIdea) {
        updateIdea(projectModal.prefillFromIdea.id, {
          status: 'project',
          relatedProjectId: created.id,
        });
      }
    }

    closeProjectModal();
  };

  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-2xl sm:rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {projectModal.editId
                ? 'Edit Project'
                : projectModal.prefillFromIdea
                ? 'Convert Idea to Project'
                : 'New Project'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Define scope, project ownership, and connect to a client if applicable
            </p>
          </div>
          <button
            onClick={closeProjectModal}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member Submission Notice */}
          {isMember && !projectModal.editId && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Member Project Submission:</strong> This deliverable will be submitted to the Admin for approval. Connect it to your client account below.
              </span>
            </div>
          )}

          {/* Project Type Question: Self Project vs Client Project (Admin only) */}
          {!isMember ? (
            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                Is this a Self Project or a Client Project? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProjectType('self');
                    setClientId('');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    projectType === 'self'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <User className="w-4 h-4 text-indigo-500" />
                      <span>Self Project</span>
                    </div>
                    {projectType === 'self' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Personal growth, tools, apps, and self-learning
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setProjectType('client')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    projectType === 'client'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span>Client Project</span>
                    </div>
                    {projectType === 'client' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Commissioned or contract work for an external client
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Client Project Deliverable</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold uppercase">
                Member Workspace
              </span>
            </div>
          )}

          {/* Client Selection (when Client Project is chosen or member mode) */}
          {(projectType === 'client' || isMember) && (
            <div className="p-3.5 rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-950/20 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Select Client to Connect *
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickAddClient(!showQuickAddClient)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showQuickAddClient ? 'Cancel' : 'Add New Client'}</span>
                </button>
              </div>

              {/* Inline Quick Add Client */}
              {showQuickAddClient ? (
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 space-y-2">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {isMember ? 'Register New Client (Submit for Approval)' : 'Quick Add Client'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
                        Client / Company Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hotel Grand, Apex Tech..."
                        value={newClientCompany}
                        onChange={(e) => setNewClientCompany(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
                        Client Contact Person Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Siddharth Rao, Manager..."
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                      />
                    </div>
                  </div>
                  <input
                    type="email"
                    placeholder="Client Email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowQuickAddClient(false)}
                      className="px-2.5 py-1 text-xs text-neutral-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateQuickClient}
                      className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      {isMember ? 'Submit & Connect Client' : 'Save & Connect Client'}
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={clientId}
                  required
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Choose a Client to Connect --</option>
                  {(isMember ? visibleClients : clients).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} — {c.name} {c.approvalStatus === 'pending' ? '(Pending Approval)' : ''}
                    </option>
                  ))}
                </select>
              )}

              {selectedClient && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
                  <div className="w-7 h-7 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[11px]">
                    {selectedClient.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {selectedClient.company}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate">
                      Contact: {selectedClient.name} · {selectedClient.email}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Connected
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Client Website Redesign, Distributed Systems Study..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the purpose and core deliverables of this project?"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Client Work, Web Portal, Research"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Progress Percentage
              </label>
              <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Related Service Account (Optional)
              </label>
              <select
                value={relatedAccountId}
                onChange={(e) => setRelatedAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">None</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.service} ({acc.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. React, Client, Portal"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Technical Resources & Plan Links (GitHub, Database, Live App, Plan) */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Technical Specifications & Resource Links</span>
              </div>
              <span className="text-[11px] text-neutral-400">GitHub · Database · Plan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                  <span>GitHub Repository Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/org/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-500" />
                  <span>Publish URL / Live App Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://myproject.app or https://app.example.com"
                  value={publishUrl || liveUrl}
                  onChange={(e) => {
                    setPublishUrl(e.target.value);
                    setLiveUrl(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                  <Database className="w-3 h-3 text-indigo-500" />
                  <span>Database Engine / Provider</span>
                </label>
                <select
                  value={databaseType}
                  onChange={(e) => setDatabaseType(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">None / Not configured</option>
                  <option value="PostgreSQL (Cloud SQL)">PostgreSQL (Cloud SQL)</option>
                  <option value="Firebase Firestore">Firebase Firestore</option>
                  <option value="Supabase">Supabase</option>
                  <option value="MySQL">MySQL</option>
                  <option value="MongoDB">MongoDB</option>
                  <option value="Redis">Redis</option>
                  <option value="SQLite">SQLite / Local</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Database Link / Console Endpoint
                </label>
                <input
                  type="text"
                  placeholder="postgresql://... or console.firebase..."
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Database Details & Security Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Cluster region, security rules, backup cadence..."
                value={databaseNotes}
                onChange={(e) => setDatabaseNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-500" />
                <span>Project Plan & Architecture Overview</span>
              </label>
              <textarea
                rows={2}
                placeholder="Summary of project plan, architecture specifications, and delivery milestones..."
                value={planDetails}
                onChange={(e) => setPlanDetails(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={closeProjectModal}
              className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
            >
              {isMember && !projectModal.editId && <Clock className="w-3.5 h-3.5" />}
              <span>
                {isMember && !projectModal.editId
                  ? 'Submit Project for Approval'
                  : projectModal.editId
                  ? 'Save Changes'
                  : 'Create Project'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

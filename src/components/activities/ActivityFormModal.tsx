import React, { useState, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { Activity, ActivityType } from '../../types';
import { X, ChevronDown, ChevronUp, Clock, Building2, User, Sparkles, FolderGit2, Plus, Link2, Check } from 'lucide-react';

export const ActivityFormModal: React.FC = () => {
  const {
    activityModal,
    closeActivityModal,
    addActivity,
    updateActivity,
    projects,
    clients,
    addClient,
    updateProject,
    openProjectModal,
    showToast,
  } = useJourney();

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ActivityType>('work');
  const [date, setDate] = useState(getTodayDate);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Project linkage mode: 'none' | 'self' | 'client'
  const [projectContext, setProjectContext] = useState<'none' | 'self' | 'client'>('none');
  const [projectId, setProjectId] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');

  // Quick inline client creation
  const [showQuickAddClient, setShowQuickAddClient] = useState(false);
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Inline connect existing project to client
  const [showConnectExisting, setShowConnectExisting] = useState(false);
  const [projectToConnectId, setProjectToConnectId] = useState('');

  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (activityModal.isOpen) {
      setShowQuickAddClient(false);
      setShowConnectExisting(false);
      setNewClientCompany('');
      setNewClientName('');
      setNewClientEmail('');
      setProjectToConnectId('');

      if (activityModal.initialData) {
        setTitle(activityModal.initialData.title || '');
        setDescription(activityModal.initialData.description || '');
        setType(activityModal.initialData.type || 'work');
        setDate(activityModal.initialData.date || getTodayDate());
        setStartTime(activityModal.initialData.startTime || '');
        setEndTime(activityModal.initialData.endTime || '');
        setDurationMinutes(activityModal.initialData.durationMinutes || 30);

        const initialProjId = activityModal.initialData.projectId || '';
        const initialClId = activityModal.initialData.clientId || '';

        // Check if the specified project already has a client
        const matchedProj = projects.find((p) => p.id === initialProjId);
        if (matchedProj?.clientId) {
          setProjectContext('client');
          setClientId(matchedProj.clientId);
          setProjectId(matchedProj.id);
        } else if (initialClId) {
          setProjectContext('client');
          setClientId(initialClId);
          setProjectId(initialProjId);
        } else if (initialProjId) {
          setProjectContext('self');
          setProjectId(initialProjId);
          setClientId('');
        } else {
          setProjectContext('none');
          setProjectId('');
          setClientId('');
        }

        setTagInput((activityModal.initialData.tags || []).join(', '));
        setNotes(activityModal.initialData.notes || '');
      } else {
        // Reset defaults
        setTitle('');
        setDescription('');
        setType('work');
        setDate(getTodayDate());
        setStartTime('');
        setEndTime('');
        setDurationMinutes(30);
        setProjectContext('none');
        setProjectId('');
        setClientId('');
        setTagInput('');
        setNotes('');
        setShowMore(false);
      }
    }
  }, [activityModal, projects]);

  if (!activityModal.isOpen) return null;

  // Filter projects by context
  const clientProjects = projects.filter((p) => p.clientId === clientId);
  const selfProjects = projects.filter((p) => !p.clientId);
  const availableProjectsToConnect = projects.filter((p) => p.clientId !== clientId);

  const handleSelectClient = (cId: string) => {
    setClientId(cId);
    setShowConnectExisting(false);
    // If the currently selected project doesn't belong to this client, pick the first project or reset
    const matchingProjects = projects.filter((p) => p.clientId === cId);
    if (matchingProjects.length > 0) {
      setProjectId(matchingProjects[0].id);
    } else {
      setProjectId('');
    }
  };

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
    setProjectId('');
    setShowQuickAddClient(false);
    setNewClientCompany('');
    setNewClientName('');
    setNewClientEmail('');
    showToast(`Client "${created.company}" added! Now select or connect a project.`, 'success');
  };

  const handleConnectExistingProjectToClient = () => {
    if (!projectToConnectId || !clientId) return;
    updateProject(projectToConnectId, { clientId });
    setProjectId(projectToConnectId);
    setShowConnectExisting(false);
    setProjectToConnectId('');
    const targetProject = projects.find((p) => p.id === projectToConnectId);
    const targetClient = clients.find((c) => c.id === clientId);
    showToast(
      `Project "${targetProject?.name}" connected to client "${targetClient?.company}"!`,
      'success'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (projectContext === 'client' && !clientId) {
      alert('Please select or add a client for this Client Project time entry.');
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let finalProjectId: string | undefined = undefined;
    let finalClientId: string | undefined = undefined;

    if (projectContext === 'client') {
      finalClientId = clientId || undefined;
      finalProjectId = projectId || undefined;
    } else if (projectContext === 'self') {
      finalProjectId = projectId || undefined;
      finalClientId = undefined;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      durationMinutes: Number(durationMinutes) || 30,
      projectId: finalProjectId,
      clientId: finalClientId,
      tags,
      notes: notes.trim() || undefined,
    };

    if (activityModal.editId) {
      updateActivity(activityModal.editId, payload);
      showToast('Activity updated successfully', 'success');
    } else {
      addActivity(payload);
      showToast('Activity and time logged successfully', 'success');
    }

    closeActivityModal();
  };

  const durationPresets = [15, 30, 45, 60, 90, 120];
  const selectedClientObj = clients.find((c) => c.id === clientId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-2xl sm:rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {activityModal.editId ? 'Edit Activity' : 'Record Activity & Project Time'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Log focused time, connect to self projects or client deliverables
            </p>
          </div>
          <button
            onClick={closeActivityModal}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              What did you work on? *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Built Client Portal, Reviewed specs, Reading Atomic Habits..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Project Connection: Ask Self Project or Client Project */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Project Type: Self Project or Client Project? *
                </label>
                <span className="text-[11px] text-neutral-400">Time allocation</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProjectContext('self');
                    setClientId('');
                    if (selfProjects.length > 0 && !selfProjects.some((p) => p.id === projectId)) {
                      setProjectId(selfProjects[0].id);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    projectContext === 'self'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    {projectContext === 'self' && <Check className="w-3 h-3 text-indigo-600" />}
                  </div>
                  <div className="text-xs font-semibold">Self Project</div>
                  <div className="text-[10px] text-neutral-500 truncate">Personal & learning</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProjectContext('client');
                    if (clients.length > 0 && !clientId) {
                      handleSelectClient(clients[0].id);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    projectContext === 'client'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    {projectContext === 'client' && <Check className="w-3 h-3 text-indigo-600" />}
                  </div>
                  <div className="text-xs font-semibold">Client Project</div>
                  <div className="text-[10px] text-neutral-500 truncate">Deliverable for client</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProjectContext('none');
                    setProjectId('');
                    setClientId('');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    projectContext === 'none'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {projectContext === 'none' && <Check className="w-3 h-3 text-indigo-600" />}
                  </div>
                  <div className="text-xs font-semibold">Standalone</div>
                  <div className="text-[10px] text-neutral-500 truncate">General habit/reading</div>
                </button>
              </div>
            </div>

            {/* If Self Project: pick self project */}
            {projectContext === 'self' && (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Select Self / Personal Project
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      closeActivityModal();
                      openProjectModal();
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Project</span>
                  </button>
                </div>

                {selfProjects.length === 0 ? (
                  <div className="p-3 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400">
                    No self projects created yet.{' '}
                    <button
                      type="button"
                      onClick={() => {
                        closeActivityModal();
                        openProjectModal();
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold underline ml-1 cursor-pointer"
                    >
                      Create your first Self Project
                    </button>
                  </div>
                ) : (
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Self Project --</option>
                    {selfProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.progress}% completed · {p.category})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* If Client Project: 1. Select Client, 2. Select Project connected to that particular client */}
            {projectContext === 'client' && (
              <div className="space-y-3 pt-1 animate-in fade-in duration-100">
                {/* 1. Client Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      1. Select Client *
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

                  {/* Inline quick client creator */}
                  {showQuickAddClient ? (
                    <div className="p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-neutral-900 space-y-2 mb-2">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        Add New Client
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Company / Client Name *"
                          value={newClientCompany}
                          onChange={(e) => setNewClientCompany(e.target.value)}
                          className="px-2.5 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                        />
                        <input
                          type="text"
                          placeholder="Contact Person (e.g. Alex Smith)"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                          className="px-2.5 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowQuickAddClient(false)}
                          className="px-2.5 py-1 text-xs text-neutral-500 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateQuickClient}
                          className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                        >
                          Save Client & Select
                        </button>
                      </div>
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="p-3 rounded-lg border border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-300">
                      No clients found yet.{' '}
                      <button
                        type="button"
                        onClick={() => setShowQuickAddClient(true)}
                        className="font-semibold underline ml-1 cursor-pointer"
                      >
                        + Add your first client now
                      </button>
                    </div>
                  ) : (
                    <select
                      value={clientId}
                      required
                      onChange={(e) => handleSelectClient(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">-- Choose Client --</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company} ({c.name})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 2. Project Selection for this Particular Client */}
                {clientId && (
                  <div className="space-y-2 pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        2. Select Project Connected to {selectedClientObj?.company || 'Client'} *
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowConnectExisting(!showConnectExisting)}
                          className="text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>{showConnectExisting ? 'Close' : 'Connect Existing Project'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            closeActivityModal();
                            openProjectModal(undefined, undefined, clientId);
                          }}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>New Project</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline drawer to connect an existing project to this client */}
                    {showConnectExisting && (
                      <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-2 animate-in fade-in duration-100">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          Connect Existing Project to {selectedClientObj?.company}
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          Pick an existing project to link it directly to this client:
                        </p>
                        <div className="flex items-center gap-2">
                          <select
                            value={projectToConnectId}
                            onChange={(e) => setProjectToConnectId(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                          >
                            <option value="">-- Choose Project to Connect --</option>
                            {availableProjectsToConnect.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} {p.clientId ? '(Reassign client)' : '(Self project)'}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={!projectToConnectId}
                            onClick={handleConnectExistingProjectToClient}
                            className="px-3 py-1.5 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shrink-0"
                          >
                            Connect
                          </button>
                        </div>
                      </div>
                    )}

                    {clientProjects.length === 0 ? (
                      <div className="p-3 rounded-lg border border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                        <div className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                          No projects currently connected to {selectedClientObj?.company}.
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowConnectExisting(true)}
                            className="px-2.5 py-1 text-xs font-medium rounded border border-amber-400 dark:border-amber-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 cursor-pointer"
                          >
                            Connect Existing Project
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              closeActivityModal();
                              openProjectModal(undefined, undefined, clientId);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                          >
                            + Create New Project for {selectedClientObj?.company}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={projectId}
                        required
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">-- Choose Project for {selectedClientObj?.company} --</option>
                        {clientProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.progress}% completed · {p.category})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Activity Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="work">Work / Deliverable</option>
                <option value="building">Building / Coding</option>
                <option value="meeting">Meeting / Call</option>
                <option value="learning">Learning / Research</option>
                <option value="reading">Reading</option>
                <option value="goal">Goal / Milestone</option>
                <option value="achievement">Achievement</option>
                <option value="exercise">Exercise / Health</option>
                <option value="personal">Personal</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Duration & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Duration (minutes)
              </label>
              <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {durationMinutes >= 60
                  ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60 ? (durationMinutes % 60) + 'm' : ''}`
                  : `${durationMinutes}m`}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min="1"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-24 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {durationPresets.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-2 py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                      durationMinutes === mins
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. Design, Frontend, Client, Review"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* More details accordion */}
          <div>
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            >
              {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showMore ? 'Less details' : 'More details (Time of Day, Notes, Description)'}</span>
            </button>

            {showMore && (
              <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Start Time (HH:MM)
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      End Time (HH:MM)
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Description / Reflection
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about what was completed..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Personal Reflection / Key Takeaway
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Quotes, takeaways, or insights to remember..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={closeActivityModal}
              className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
            >
              {activityModal.editId ? 'Save Changes' : 'Record Activity & Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

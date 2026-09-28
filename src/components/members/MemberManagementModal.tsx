import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useJourney } from '../../context/JourneyContext';
import { TeamMember, UserRole } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import {
  Users,
  UserPlus,
  X,
  Check,
  Building2,
  FolderGit2,
  KeyRound,
  Mail,
  Shield,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { SendMessageModal } from '../messages/SendMessageModal';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    teamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    clients,
    projects,
    loginUser,
    showToast,
  } = useJourney();

  // Mode: 'list' or 'create' or 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Password visibility map for members list
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Messaging submodal state
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState('');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (messageModalOpen) {
          setMessageModalOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, messageModalOpen, onClose]);

  if (!isOpen) return null;

  // Filter client-associated projects
  const clientProjects = projects.filter((p) => !!p.clientId && p.clientId !== 'self');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setTitle('');
    setRole('member');
    setSelectedClientIds([]);
    setSelectedProjectIds([]);
    setEditingMemberId(null);
    setShowFormPassword(false);
  };

  const handleStartCreate = () => {
    resetForm();
    setPassword('pwd_' + Math.random().toString(36).slice(-6));
    setViewMode('form');
  };

  const handleStartEdit = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setName(member.name);
    setEmail(member.email);
    setPassword(member.password || '');
    setTitle(member.title || '');
    setRole(member.role);
    setSelectedClientIds(member.assignedClientIds || []);
    setSelectedProjectIds(member.assignedProjectIds || []);
    setViewMode('form');
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pwd = '';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClientIds((prev) => {
      const exists = prev.includes(clientId);
      const next = exists ? prev.filter((id) => id !== clientId) : [...prev, clientId];

      // Auto-select projects of this client if selecting client
      if (!exists) {
        const clientProjs = clientProjects
          .filter((p) => p.clientId === clientId)
          .map((p) => p.id);
        setSelectedProjectIds((prevP) => Array.from(new Set([...prevP, ...clientProjs])));
      }
      return next;
    });
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSelectAllClients = () => {
    const allCIds = clients.map((c) => c.id);
    const allPIds = clientProjects.map((p) => p.id);
    setSelectedClientIds(allCIds);
    setSelectedProjectIds(allPIds);
  };

  const handleClearAllAllocations = () => {
    setSelectedClientIds([]);
    setSelectedProjectIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Please enter both name and email', 'warning');
      return;
    }

    const finalEmail = email.trim().toLowerCase();
    const finalPassword = password || 'member123';

    if (editingMemberId) {
      updateTeamMember(editingMemberId, {
        name,
        email: finalEmail,
        password,
        title: title || (role === 'admin' ? 'Administrator' : 'Client Specialist'),
        role,
        assignedClientIds: selectedClientIds,
        assignedProjectIds: selectedProjectIds,
      });
      showToast(`Member "${name}" updated successfully!`);
    } else {
      // 1. Add to local team members list (visible immediately)
      addTeamMember({
        name,
        email: finalEmail,
        password: finalPassword,
        title: title || (role === 'admin' ? 'Administrator' : 'Client Project Specialist'),
        role,
        assignedClientIds: selectedClientIds,
        assignedProjectIds: selectedProjectIds,
      });

      // 2. Create real Supabase Auth account so member can sign in
      try {
        const { data: authData, error: authError } = await supabaseService.createMemberAuth(
          finalEmail,
          finalPassword,
          name,
          role
        );
        if (authError) {
          // Auth user might already exist — still created locally
          showToast(`Member "${name}" added. Note: ${(authError as any)?.message || 'Supabase auth issue'}`, 'warning');
        } else if (authData?.user?.identities?.length === 0) {
          // User already exists in Supabase auth
          showToast(`Member "${name}" added. Supabase account already exists — password may differ.`, 'info');
        } else {
          showToast(`Member "${name}" created! They can now sign in with email & password.`);
        }
      } catch {
        showToast(`Member "${name}" added locally. Supabase auth creation failed.`, 'warning');
      }
    }

    setViewMode('list');
    resetForm();
  };


  const togglePasswordReveal = (memberId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const handleQuickLoginAsMember = (member: TeamMember) => {
    loginUser(member.email, member.password);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {viewMode === 'list'
                  ? 'Team Members & Client Allocations'
                  : editingMemberId
                  ? 'Edit Member & Allocations'
                  : 'Allocate New Member (Email & Password)'}
              </h2>
              <p className="text-xs text-neutral-500">
                {viewMode === 'list'
                  ? 'Control member accounts and restrict access to allocated clients and projects only.'
                  : 'Assign login credentials and select which clients and projects this member can access.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {viewMode === 'list' ? (
            <>
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <div>
                  <div className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                    Member Access Control
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Members can only log in and view the clients and projects you assign to them.
                  </div>
                </div>

                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>+ Allocate New Member</span>
                </button>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {teamMembers.map((member) => {
                  const isOwner = member.role === 'admin';
                  const assignedClients = clients.filter((c) =>
                    (member.assignedClientIds || []).includes(c.id)
                  );
                  const assignedProjs = clientProjects.filter((p) =>
                    (member.assignedProjectIds || []).includes(p.id)
                  );
                  const isPasswordRevealed = revealedPasswords[member.id];

                  return (
                    <div
                      key={member.id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 mt-0.5">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                {member.name}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                                  isOwner
                                    ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                {isOwner ? 'Admin (Full Access)' : 'Client Member'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                              <Mail className="w-3 h-3 text-neutral-400" />
                              <span className="font-mono text-[11px]">{member.email}</span>
                            </div>

                            {/* Password Badge */}
                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-neutral-500">
                              <KeyRound className="w-3 h-3 text-amber-500" />
                              <span className="text-[11px] font-mono">
                                Password:{' '}
                                {isPasswordRevealed
                                  ? member.password || 'password123'
                                  : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordReveal(member.id)}
                                className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                                title={isPasswordRevealed ? 'Hide password' : 'View password'}
                              >
                                {isPasswordRevealed ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleQuickLoginAsMember(member)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer flex items-center gap-1"
                            title="Test logging in as this member"
                          >
                            <span>Test Login</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => {
                              setMessageRecipient(member.email);
                              setMessageModalOpen(true);
                            }}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                            title={`Send direct message to ${member.name}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {!isOwner && (
                            <>
                              <button
                                onClick={() => handleStartEdit(member)}
                                className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                                title="Edit allocations & credentials"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => deleteTeamMember(member.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                title="Delete member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Allocated Badges */}
                      {!isOwner && (
                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-[11px] font-medium text-neutral-400">
                            Allocated Access:
                          </span>

                          {assignedClients.length > 0 ? (
                            assignedClients.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 text-[10px] font-medium"
                              >
                                <Building2 className="w-2.5 h-2.5" />
                                <span>{c.company}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                              No clients allocated
                            </span>
                          )}

                          {assignedProjs.length > 0 &&
                            assignedProjs.map((p) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 text-[10px] font-medium"
                              >
                                <FolderGit2 className="w-2.5 h-2.5" />
                                <span>{p.name}</span>
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Member Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Role & Permissions
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="member">Client Member (Only sees allocated clients & projects)</option>
                    <option value="admin">Administrator (Full Access to all OS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Email ID (Login Username) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. member@client.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Login Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      required
                      placeholder="Password for member login"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {showFormPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Client & Project Allocation Selectors (Only applicable if Member) */}
              {role === 'member' ? (
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Allocate Allowed Clients & Projects</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        This member will ONLY see the items selected below when logging in.
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllClients}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <button
                        type="button"
                        onClick={handleClearAllAllocations}
                        className="text-[10px] text-neutral-500 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* 1. Allocate Clients */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                      1. Allocate Clients ({selectedClientIds.length}/{clients.length})
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {clients.map((c) => {
                        const isChecked = selectedClientIds.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-200'
                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleClientSelection(c.id)}
                              className="mt-0.5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate">{c.company}</div>
                              <div className="text-[10px] text-neutral-500 truncate">
                                {c.name} · {c.email}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Allocate Projects */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                      2. Allocate Specific Projects ({selectedProjectIds.length}/{clientProjects.length})
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {clientProjects.map((p) => {
                        const isChecked = selectedProjectIds.includes(p.id);
                        const clientName = clients.find((c) => c.id === p.clientId)?.company || 'Client';
                        return (
                          <label
                            key={p.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-200'
                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleProjectSelection(p.id)}
                              className="mt-0.5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate">{p.name}</div>
                              <div className="text-[10px] text-neutral-500 truncate">
                                Client: <span className="font-medium">{clientName}</span> · Progress: {p.progress}%
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-300">
                  <span className="font-semibold block">Full Admin Access:</span>
                  This administrator will have unrestricted access to all dashboard metrics, personal OS journals, ideas, growth tracking, and settings.
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('list');
                    resetForm();
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingMemberId ? 'Save Allocations' : 'Create & Allocate Member'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Direct In-App Message Submodal */}
      <SendMessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        prefillRecipientId={messageRecipient}
      />
    </div>,
    document.body
  );
};

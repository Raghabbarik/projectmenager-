import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  Users,
  UserPlus,
  Building2,
  FolderGit2,
  Mail,
  Edit2,
  Trash2,
  Shield,
  Search,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { MemberManagementModal } from '../components/members/MemberManagementModal';
import { SendMessageModal } from '../components/messages/SendMessageModal';

export const AdminMembersPage: React.FC = () => {
  const {
    teamMembers,
    deleteTeamMember,
    clients,
    projects,
    requestDelete,
    showToast,
    navigateTo,
  } = useJourney();

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member'>('all');

  const filtered = teamMembers.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.title || '').toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = teamMembers.filter((m) => m.role === 'admin').length;
  const memberCount = teamMembers.filter((m) => m.role === 'member').length;

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Team Members
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-bold uppercase">
                Admin Only
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Manage team members, allocate clients &amp; projects, and create Supabase login credentials.
            </p>
          </div>

          <button
            onClick={() => setMemberModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 dark:bg-[#e5e5cb] hover:bg-violet-700 dark:hover:bg-[#d5cea3] text-white dark:text-[#1a120b] shadow-md shadow-violet-500/20 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Member</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Members', value: teamMembers.length, color: 'text-violet-600 dark:text-violet-400' },
            { label: 'Admins', value: adminCount, color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Members', value: memberCount, color: 'text-emerald-600 dark:text-emerald-400' },
          ].map((s) => (
            <div
              key={s.label}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-center"
            >
              <div className={`text-2xl font-bold font-mono tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or title…"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'admin', 'member'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-violet-400'
                }`}
              >
                {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Members List */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 flex items-center justify-center text-violet-500 mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                {searchQuery || roleFilter !== 'all' ? 'No members match your filter' : 'No team members yet'}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {searchQuery || roleFilter !== 'all'
                  ? 'Try clearing the search or changing the role filter.'
                  : 'Click "+ Add New Member" to create the first team member.'}
              </p>
            </div>
            {!searchQuery && roleFilter === 'all' && (
              <button
                onClick={() => setMemberModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 dark:bg-[#e5e5cb] hover:bg-violet-700 dark:hover:bg-[#d5cea3] text-white dark:text-[#1a120b] shadow-md shadow-violet-500/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add First Member</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((m) => {
              const isOwner = m.role === 'admin';
              const assignedClients = clients.filter((c) =>
                (m.assignedClientIds || []).includes(c.id)
              );
              const assignedProjs = projects.filter((p) =>
                (m.assignedProjectIds || []).includes(p.id)
              );

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                >
                  {/* Top: Avatar + Info + Role */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm ${
                        isOwner
                          ? 'bg-gradient-to-br from-indigo-600 to-violet-600'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                      }`}
                    >
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {m.name}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                            isOwner
                              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {isOwner ? 'Admin' : 'Member'}
                        </span>
                      </div>
                      {m.title && (
                        <div className="text-[11px] text-neutral-500 mt-0.5">{m.title}</div>
                      )}
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5 truncate">
                        {m.email}
                      </div>
                    </div>
                  </div>

                  {/* Supabase Auth indicator */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Supabase Auth account created · signs in with email &amp; password
                    </span>
                  </div>

                  {/* Allocations */}
                  {(assignedClients.length > 0 || assignedProjs.length > 0) ? (
                    <div className="space-y-1.5">
                      {assignedClients.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {assignedClients.map((c) => (
                            <span
                              key={c.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                            >
                              <Building2 className="w-2.5 h-2.5" />
                              {c.company}
                            </span>
                          ))}
                        </div>
                      )}
                      {assignedProjs.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {assignedProjs.map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60"
                            >
                              <FolderGit2 className="w-2.5 h-2.5" />
                              {p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    !isOwner && (
                      <div className="text-[10px] text-neutral-400 italic">
                        No clients or projects allocated yet
                      </div>
                    )
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() => setMemberModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-[#e5e5cb] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setMessageRecipient(m.email);
                        setMessageModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-[#e5e5cb] transition-colors cursor-pointer"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Message</span>
                    </button>

                    {!isOwner && (
                      <button
                        onClick={() =>
                          requestDelete({
                            title: `Remove ${m.name}?`,
                            message: `This will remove ${m.name} from the team. Their Supabase auth account will remain.`,
                            confirmLabel: 'Remove Member',
                            isDestructive: true,
                            onConfirm: () => deleteTeamMember(m.id),
                          })
                        }
                        className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-rose-500 dark:text-rose-400 border border-neutral-200 dark:border-neutral-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <MemberManagementModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
      />
      {messageModalOpen && (
        <SendMessageModal
          isOpen={messageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          prefillRecipientId={messageRecipient}
        />
      )}
    </>
  );
};

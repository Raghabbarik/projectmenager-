import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  KeyRound,
  Plus,
  ShieldCheck,
  MoreVertical,
  Edit2,
  Trash2,
  FolderGit2,
  Search,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const AccountsPage: React.FC = () => {
  const {
    accounts,
    projects,
    openAccountModal,
    requestDelete,
    deleteAccount,
    navigateTo,
  } = useJourney();

  const [search, setSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredAccounts = accounts.filter((acc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      acc.service.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      acc.purpose.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Accounts & Service Identifiers
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track which email/identity is used for deployment, hosting, domains, and cloud tools
          </p>
        </div>

        <button
          onClick={() => openAccountModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Security Banner */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p>
          <strong className="font-semibold">Zero-Secret Principle:</strong> Only email addresses and provider purpose are stored here. We never record, prompt for, or persist passwords, tokens, or credentials.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by provider or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Accounts List / Table */}
      {filteredAccounts.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No accounts tracked"
          description="Keep a clear record of which work accounts are associated with your services."
          actionLabel="Track Account"
          onAction={() => openAccountModal()}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Service / Tool</th>
                  <th className="px-4 py-3">Registered Email</th>
                  <th className="px-4 py-3">Work Purpose</th>
                  <th className="px-4 py-3">Linked Projects</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                {filteredAccounts.map((acc) => {
                  const linkedProjects = projects.filter((p) =>
                    (acc.linkedProjectIds || []).includes(p.id)
                  );

                  return (
                    <tr
                      key={acc.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400">
                            <KeyRound className="w-3.5 h-3.5" />
                          </div>
                          <span>{acc.service}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-neutral-700 dark:text-neutral-300">
                        {acc.email}
                      </td>

                      <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-400">
                        {acc.purpose}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {linkedProjects.length === 0 ? (
                            <span className="text-[11px] text-neutral-400 italic">None</span>
                          ) : (
                            linkedProjects.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => navigateTo('project-detail', p.id)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] hover:text-indigo-600 cursor-pointer"
                              >
                                <FolderGit2 className="w-2.5 h-2.5" />
                                <span>{p.name}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openAccountModal(acc.id)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              requestDelete({
                                title: 'Delete Account Mapping?',
                                message: `Remove record for ${acc.service} (${acc.email})?`,
                                confirmLabel: 'Delete Record',
                                onConfirm: () => deleteAccount(acc.id),
                              })
                            }
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

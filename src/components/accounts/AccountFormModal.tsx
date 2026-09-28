import React, { useState, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { X, ShieldCheck } from 'lucide-react';

export const AccountFormModal: React.FC = () => {
  const {
    accountModal,
    closeAccountModal,
    addAccount,
    updateAccount,
    accounts,
    projects,
  } = useJourney();

  const [service, setService] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  useEffect(() => {
    if (accountModal.isOpen) {
      if (accountModal.editId) {
        const item = accounts.find((a) => a.id === accountModal.editId);
        if (item) {
          setService(item.service);
          setEmail(item.email);
          setPurpose(item.purpose);
          setSelectedProjects(item.linkedProjectIds || []);
        }
      } else {
        setService('');
        setEmail('work@gmail.com');
        setPurpose('');
        setSelectedProjects([]);
      }
    }
  }, [accountModal, accounts]);

  if (!accountModal.isOpen) return null;

  const handleToggleProject = (id: string) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service.trim() || !email.trim()) return;

    const payload = {
      service: service.trim(),
      email: email.trim(),
      purpose: purpose.trim() || 'Development / Operations',
      linkedProjectIds: selectedProjects,
    };

    if (accountModal.editId) {
      updateAccount(accountModal.editId, payload);
    } else {
      addAccount(payload);
    }

    closeAccountModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-2xl sm:rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {accountModal.editId ? 'Edit Account Mapping' : 'Track Service Account'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Track which email/account is used for different work
            </p>
          </div>
          <button
            onClick={closeAccountModal}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-2.5 mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 text-[11px]">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Security safe: Only emails and service identities are recorded. Never passwords or API secrets.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Service / Provider *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. GitHub, Vercel, Firebase, AWS, Domain..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Associated Email / Login *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. work@gmail.com, developer@company.com"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Work Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Production Hosting, Domain DNS, Auth Provider"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Linked Projects
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
              {projects.map((p) => {
                const isChecked = selectedProjects.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleProject(p.id)}
                      className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={closeAccountModal}
              className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
            >
              {accountModal.editId ? 'Save Changes' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

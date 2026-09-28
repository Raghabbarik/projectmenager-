import React, { useState, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { X, FolderGit2, Check, Clock } from 'lucide-react';

export const ClientFormModal: React.FC = () => {
  const {
    clientModal,
    closeClientModal,
    addClient,
    updateClient,
    clients,
    projects,
    visibleProjects,
    isMember,
    updateProject,
  } = useJourney();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  useEffect(() => {
    if (clientModal.isOpen) {
      if (clientModal.editId) {
        const item = clients.find((c) => c.id === clientModal.editId);
        if (item) {
          setName(item.name);
          setCompany(item.company);
          setEmail(item.email);
          setPhone(item.phone);
          setNotes(item.notes || '');

          const linkedProjects = projects
            .filter((p) => p.clientId === item.id)
            .map((p) => p.id);
          setSelectedProjectIds(linkedProjects);
        }
      } else {
        setName('');
        setCompany('');
        setEmail('');
        setPhone('');
        setNotes('');
        setSelectedProjectIds([]);
      }
    }
  }, [clientModal, clients, projects]);

  if (!clientModal.isOpen) return null;

  const toggleProject = (pId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;

    const payload = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim() || undefined,
    };

    let targetClientId = clientModal.editId;

    if (clientModal.editId) {
      updateClient(clientModal.editId, payload);
    } else {
      const created = addClient(payload);
      targetClientId = created.id;
    }

    // Connect selected projects to this client
    if (targetClientId) {
      projects.forEach((p) => {
        const shouldBeLinked = selectedProjectIds.includes(p.id);
        const isCurrentlyLinked = p.clientId === targetClientId;
        if (shouldBeLinked && !isCurrentlyLinked) {
          updateProject(p.id, { clientId: targetClientId });
        } else if (!shouldBeLinked && isCurrentlyLinked) {
          updateProject(p.id, { clientId: undefined });
        }
      });
    }

    closeClientModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-2xl sm:rounded-xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {clientModal.editId ? 'Edit Client' : 'Add Client & Connect Projects'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Organize stakeholder contacts and attach deliverables
            </p>
          </div>
          <button
            onClick={closeClientModal}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Member Submission Notice */}
          {isMember && !clientModal.editId && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Member Submission:</strong> As a member, this new client will be submitted to the Admin for approval. You can connect it directly with your deliverables.
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Company / Organization *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. ABC Technologies, Apex Digital..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Primary Contact Person *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Siddharth Rao"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Connect to Existing Projects directly */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
              Connect to Projects (Optional)
            </label>
            <p className="text-[11px] text-neutral-500 mb-2">
              Select which projects are executed for this client:
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              {(isMember ? visibleProjects : projects).length === 0 ? (
                <div className="text-[11px] text-neutral-400 italic">No projects available to connect.</div>
              ) : (
                (isMember ? visibleProjects : projects).map((p) => {
                  const isChecked = selectedProjectIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between p-2 rounded text-xs transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FolderGit2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProject(p.id)}
                        className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 ml-2"
                      />
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Notes & Contract Terms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key meeting cadence, project scope, or notes..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={closeClientModal}
              className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
            >
              {isMember && !clientModal.editId && <Clock className="w-3.5 h-3.5" />}
              <span>
                {isMember && !clientModal.editId
                  ? 'Submit Client for Approval'
                  : clientModal.editId
                  ? 'Save Changes'
                  : 'Save Client & Connect'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useJourney } from '../../context/JourneyContext';
import {
  X,
  Send,
  Mail,
  User,
  Building2,
  FolderGit2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillRecipientId?: string;
  prefillSubject?: string;
  prefillContent?: string;
  prefillProjectId?: string;
  prefillClientId?: string;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  prefillRecipientId,
  prefillSubject,
  prefillContent,
  prefillProjectId,
  prefillClientId,
}) => {
  const { teamMembers, projects, clients, sendMessage, isAdmin, user } = useJourney();

  const [recipientId, setRecipientId] = useState<string>('all');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (prefillRecipientId) {
        setRecipientId(prefillRecipientId);
      } else if (teamMembers.length > 0) {
        // Find first member who is not current user
        const otherMember = teamMembers.find(
          (m) => m.email.toLowerCase() !== user.email.toLowerCase()
        );
        setRecipientId(otherMember ? otherMember.email : 'all');
      } else {
        setRecipientId('all');
      }

      setSubject(prefillSubject || '');
      setContent(prefillContent || '');
      setSelectedProjectId(prefillProjectId || '');
      setSelectedClientId(prefillClientId || '');
    }
  }, [
    isOpen,
    prefillRecipientId,
    prefillSubject,
    prefillContent,
    prefillProjectId,
    prefillClientId,
    teamMembers,
    user.email,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    sendMessage({
      recipientId,
      subject: subject.trim(),
      content: content.trim(),
      relatedProjectId: selectedProjectId || undefined,
      relatedClientId: selectedClientId || undefined,
    });

    onClose();
  };

  const handleTemplate = (tmplSubject: string, tmplContent: string) => {
    setSubject(tmplSubject);
    setContent(tmplContent);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {isAdmin ? 'Send Message to Member' : 'Send Message to Admin'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                Direct in-app communication for client and project updates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Templates */}
        {isAdmin && (
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Quick Templates:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleTemplate(
                    'Client & Project Allocation Confirmed',
                    'Hello, your account has been allocated to active client accounts. You can now track tasks and deliverables. If you have any questions or new clients to register, submit them for approval.'
                  )
                }
                className="text-[11px] px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                📋 Allocation
              </button>
              <button
                type="button"
                onClick={() =>
                  handleTemplate(
                    'Project Submission Approved',
                    'Congratulations! Your submitted project has been reviewed, approved, and activated in the workspace. Great job structuring the initial specs.'
                  )
                }
                className="text-[11px] px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
              >
                ✅ Project Approved
              </button>
              <button
                type="button"
                onClick={() =>
                  handleTemplate(
                    'Weekly Deliverable Check-in',
                    'Hi team, please ensure all completed tasks and activities for your allocated client projects are logged by Friday 5 PM.'
                  )
                }
                className="text-[11px] px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              >
                ⏱️ Weekly Check-in
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Recipient Selection */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Recipient *
            </label>
            <select
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {isAdmin && <option value="all">📢 All Team Members (Broadcast)</option>}
              {teamMembers
                .filter((m) => m.email.toLowerCase() !== user.email.toLowerCase())
                .map((m) => (
                  <option key={m.id} value={m.email}>
                    {m.name} ({m.role === 'admin' ? 'Admin' : 'Member'} · {m.email})
                  </option>
                ))}
              {!isAdmin && (
                <option value="admin">Alex Mercer (Administrator)</option>
              )}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Update regarding ABC Technologies deliverables"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Connected Project (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Connected Project (Optional)</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">None / General</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Connected Client (Optional) */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Connected Client (Optional)</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">None / General</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Message Content *
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message or project instructions here..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!subject.trim() || !content.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

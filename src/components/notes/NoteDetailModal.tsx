import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useJourney } from '../../context/JourneyContext';
import { Note } from '../../types';
import { openNoteInNewTab } from '../../utils/tabUtils';
import {
  FileText,
  X,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  FolderGit2,
  Building2,
  Lightbulb,
  Calendar,
  Tag,
  Printer,
} from 'lucide-react';

interface NoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  isOpen,
  onClose,
  note,
}) => {
  const {
    openNoteModal,
    deleteNote,
    requestDelete,
    projects,
    clients,
    ideas,
    navigateTo,
    showToast,
  } = useJourney();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !note) return null;

  const linkedProject = projects.find((p) => p.id === note.linkedProjectId);
  const linkedClient = clients.find((c) => c.id === note.linkedClientId);
  const linkedIdea = ideas.find((i) => i.id === note.linkedIdeaId);

  const wordCount = note.content
    ? note.content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = note.content ? note.content.length : 0;

  const handleCopy = () => {
    if (!note.content) return;
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true);
    showToast('Note copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenTab = () => {
    openNoteInNewTab(note);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-start gap-3.5 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 mt-0.5">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  Note & Knowledge
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {wordCount} words · {charCount} chars
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-snug break-words">
                {note.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Open in New Tab Button */}
            <button
              onClick={handleOpenTab}
              title="Open note in another tab"
              className="p-2 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              title="Copy note text"
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              title="Print note"
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-150 dark:border-neutral-800 text-xs">
            <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {note.createdAt ? note.createdAt.slice(0, 10) : 'Recent'}</span>
              <span>·</span>
              <span>Updated {note.updatedAt ? note.updatedAt.slice(0, 10) : 'Recent'}</span>
            </div>

            {/* Linked Entities */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {linkedProject && (
                <button
                  onClick={() => {
                    onClose();
                    navigateTo('project-detail', linkedProject.id);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold hover:underline cursor-pointer border border-indigo-200/50 dark:border-indigo-800/50"
                >
                  <FolderGit2 className="w-3 h-3" />
                  <span>{linkedProject.name}</span>
                </button>
              )}
              {linkedClient && (
                <button
                  onClick={() => {
                    onClose();
                    navigateTo('client-detail', linkedClient.id);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold hover:underline cursor-pointer border border-blue-200/50 dark:border-blue-800/50"
                >
                  <Building2 className="w-3 h-3" />
                  <span>{linkedClient.company}</span>
                </button>
              )}
              {linkedIdea && (
                <button
                  onClick={() => {
                    onClose();
                    navigateTo('ideas');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold hover:underline cursor-pointer border border-amber-200/50 dark:border-amber-800/50"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>{linkedIdea.title}</span>
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Full Note Content */}
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
            <div className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap font-sans leading-relaxed break-words select-text">
              {note.content}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-150 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 shrink-0">
          <button
            onClick={() =>
              requestDelete({
                title: 'Delete Note?',
                message: `Are you sure you want to permanently delete "${note.title}"?`,
                confirmLabel: 'Delete Note',
                isDestructive: true,
                onConfirm: () => {
                  deleteNote(note.id);
                  onClose();
                },
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-neutral-200 dark:border-neutral-700 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenTab}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900/60 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </button>
            <button
              onClick={() => {
                onClose();
                openNoteModal(note.id);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Note</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

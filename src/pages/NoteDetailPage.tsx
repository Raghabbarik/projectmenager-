import React, { useState, useEffect } from 'react';
import { useJourney } from '../context/JourneyContext';
import { Note } from '../types';
import {
  FileText,
  ArrowLeft,
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
  ExternalLink,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const NoteDetailPage: React.FC = () => {
  const {
    notes,
    selectedNoteId,
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

  // Resolve note by selectedNoteId or URL param
  const activeNoteId =
    selectedNoteId ||
    (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('id')
      : null);

  const note = notes.find((n) => n.id === activeNoteId);

  useEffect(() => {
    if (note?.title) {
      document.title = `${note.title} · Note · My Journey`;
    }
    return () => {
      document.title = 'My Journey';
    };
  }, [note]);

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <button
          onClick={() => navigateTo('notes')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notes Vault</span>
        </button>
        <EmptyState
          icon={FileText}
          title="Note not found"
          description="The requested note could not be found or may have been deleted."
          actionLabel="View All Notes"
          onAction={() => navigateTo('notes')}
        />
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Top Nav Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => navigateTo('notes')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Notes</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={() => openNoteModal(note.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() =>
              requestDelete({
                title: 'Delete Note?',
                message: `Are you sure you want to permanently delete "${note.title}"?`,
                confirmLabel: 'Delete Note',
                isDestructive: true,
                onConfirm: () => {
                  deleteNote(note.id);
                  navigateTo('notes');
                },
              })
            }
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-neutral-200 dark:border-neutral-700 hover:border-rose-200 transition-colors cursor-pointer"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note Document Container */}
      <article className="p-6 sm:p-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
        {/* Document Header */}
        <header className="space-y-4 pb-6 border-b border-neutral-150 dark:border-neutral-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              Note
            </span>
            <span className="text-xs font-mono text-neutral-400">
              {wordCount} words · {charCount} characters
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
            {note.title}
          </h1>

          {/* Metadata & Linked Items */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 pt-1">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {note.createdAt ? note.createdAt.slice(0, 10) : 'Recent'}</span>
              <span>·</span>
              <span>Updated {note.updatedAt ? note.updatedAt.slice(0, 10) : 'Recent'}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {linkedProject && (
                <button
                  onClick={() => navigateTo('project-detail', linkedProject.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold hover:underline cursor-pointer border border-indigo-200/50"
                >
                  <FolderGit2 className="w-3 h-3" />
                  <span>{linkedProject.name}</span>
                </button>
              )}
              {linkedClient && (
                <button
                  onClick={() => navigateTo('client-detail', linkedClient.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold hover:underline cursor-pointer border border-blue-200/50"
                >
                  <Building2 className="w-3 h-3" />
                  <span>{linkedClient.company}</span>
                </button>
              )}
              {linkedIdea && (
                <button
                  onClick={() => navigateTo('ideas')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold hover:underline cursor-pointer border border-amber-200/50"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>{linkedIdea.title}</span>
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content Body */}
        <section className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans text-sm sm:text-base whitespace-pre-wrap select-text">
          {note.content}
        </section>
      </article>
    </div>
  );
};

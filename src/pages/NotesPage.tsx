import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  FolderGit2,
  Lightbulb,
  Building2,
  Calendar,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const NotesPage: React.FC = () => {
  const {
    notes,
    projects,
    ideas,
    clients,
    openNoteModal,
    requestDelete,
    deleteNote,
    navigateTo,
  } = useJourney();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Collect all unique tags across notes
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []).filter(Boolean))
  );

  const filteredNotes = notes.filter((n) => {
    if (selectedTag && !(n.tags || []).includes(selectedTag)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTags = (n.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Notes & Knowledge Vault
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Store technical takeaways, book notes, architecture decisions, and meeting notes
          </p>
        </div>

        <button
          onClick={() => openNoteModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Write Note</span>
        </button>
      </div>

      {/* Controls: Search and Tag Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search notes & content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                selectedTag === null
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes found"
          description="Capture insights, architecture diagrams, or quotes."
          actionLabel="Write Note"
          onAction={() => openNoteModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const linkedProject = projects.find((p) => p.id === note.linkedProjectId);
            const linkedIdea = ideas.find((i) => i.id === note.linkedIdeaId);
            const linkedClient = clients.find((c) => c.id === note.linkedClientId);

            return (
              <div
                key={note.id}
                className="group relative p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                      {note.title}
                    </h3>

                    <div className="relative shrink-0">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === note.id ? null : note.id)
                        }
                        className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === note.id && (
                        <div className="absolute right-0 mt-1 w-32 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-1 z-20">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              openNoteModal(note.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              requestDelete({
                                title: 'Delete Note?',
                                message: `Are you sure you want to remove "${note.title}"?`,
                                confirmLabel: 'Delete Note',
                                onConfirm: () => deleteNote(note.id),
                              });
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap font-sans line-clamp-6 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-150 dark:border-neutral-800/80 space-y-2">
                  {/* Linked Entities */}
                  {(linkedProject || linkedIdea || linkedClient) && (
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 flex-wrap">
                      {linkedProject && (
                        <button
                          onClick={() => navigateTo('project-detail', linkedProject.id)}
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          <FolderGit2 className="w-3 h-3" />
                          <span>{linkedProject.name}</span>
                        </button>
                      )}
                      {linkedIdea && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Lightbulb className="w-3 h-3" />
                          <span>{linkedIdea.title}</span>
                        </span>
                      )}
                      {linkedClient && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Building2 className="w-3 h-3" />
                          <span>{linkedClient.company}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags & Date */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span className="truncate">
                      {(note.tags || []).join(' · ')}
                    </span>
                    <span>{note.updatedAt.slice(0, 10)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

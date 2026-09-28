import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  Search,
  Clock,
  FolderGit2,
  Lightbulb,
  Building2,
  FileText,
  Paperclip,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { formatDuration } from '../components/activities/ActivityCard';

export const SearchPage: React.FC = () => {
  const {
    activities,
    projects,
    ideas,
    clients,
    notes,
    files,
    navigateTo,
  } = useJourney();

  const [query, setQuery] = useState('Firebase');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const q = query.trim().toLowerCase();

  // Search each category
  const matchedActivities = activities.filter((a) => {
    if (!q) return false;
    return (
      a.title.toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.notes || '').toLowerCase().includes(q) ||
      (a.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const matchedProjects = projects.filter((p) => {
    if (!q) return false;
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const matchedIdeas = ideas.filter((i) => {
    if (!q) return false;
    return (
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      (i.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const matchedNotes = notes.filter((n) => {
    if (!q) return false;
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      (n.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const matchedClients = clients.filter((c) => {
    if (!q) return false;
    return (
      c.company.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q)
    );
  });

  const matchedFiles = files.filter((f) => {
    if (!q) return false;
    return f.name.toLowerCase().includes(q);
  });

  const totalResults =
    matchedActivities.length +
    matchedProjects.length +
    matchedIdeas.length +
    matchedNotes.length +
    matchedClients.length +
    matchedFiles.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Global Search
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Find anything you have ever learned, recorded, built, or saved
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-neutral-400" />
        <input
          type="text"
          autoFocus
          placeholder="Search activities, projects, notes, ideas, clients..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
      </div>

      {/* Filter Tabs & Count */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All (${totalResults})` },
            { id: 'activities', label: `Activities (${matchedActivities.length})` },
            { id: 'projects', label: `Projects (${matchedProjects.length})` },
            { id: 'notes', label: `Notes (${matchedNotes.length})` },
            { id: 'ideas', label: `Ideas (${matchedIdeas.length})` },
            { id: 'clients', label: `Clients (${matchedClients.length})` },
            { id: 'files', label: `Files (${matchedFiles.length})` },
          ].map((tab) => {
            const isActive = selectedCategoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategoryFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Results */}
      {!q ? (
        <div className="p-12 text-center text-xs text-neutral-400">
          Enter a term above to search your entire journey archive.
        </div>
      ) : totalResults === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/30">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No results found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Try a different keyword or check spelling.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Projects results */}
          {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'projects') &&
            matchedProjects.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Projects ({matchedProjects.length} results)</span>
                </div>
                <div className="space-y-2">
                  {matchedProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigateTo('project-detail', p.id)}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {p.name}
                        </h4>
                        <span className="text-xs font-mono text-neutral-400">
                          {p.progress}% done
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Activities results */}
          {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'activities') &&
            matchedActivities.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Activities ({matchedActivities.length} results)</span>
                </div>
                <div className="space-y-2">
                  {matchedActivities.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => navigateTo('daily')}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {a.title}
                        </span>
                        <span className="font-mono text-neutral-400">
                          {formatDuration(a.durationMinutes)} · {a.date}
                        </span>
                      </div>
                      {a.description && (
                        <p className="text-xs text-neutral-500 mt-1">{a.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Notes results */}
          {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'notes') &&
            matchedNotes.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  <span>Notes ({matchedNotes.length} results)</span>
                </div>
                <div className="space-y-2">
                  {matchedNotes.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => navigateTo('notes')}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-xs"
                    >
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {n.title}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                        {n.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Ideas results */}
          {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'ideas') &&
            matchedIdeas.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ideas ({matchedIdeas.length} results)</span>
                </div>
                <div className="space-y-2">
                  {matchedIdeas.map((i) => (
                    <div
                      key={i.id}
                      onClick={() => navigateTo('ideas')}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {i.title}
                        </span>
                        <span className="text-neutral-400 capitalize">{i.status}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{i.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Clients results */}
          {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'clients') &&
            matchedClients.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Clients ({matchedClients.length} results)</span>
                </div>
                <div className="space-y-2">
                  {matchedClients.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => navigateTo('client-detail', c.id)}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-xs"
                    >
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {c.company} ({c.name})
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{c.email}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Files results */}
          {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'files') &&
            matchedFiles.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <Paperclip className="w-3.5 h-3.5 text-purple-500" />
                  <span>Files ({matchedFiles.length} results)</span>
                </div>
                <div className="space-y-2">
                  {matchedFiles.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => navigateTo('files')}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-xs"
                    >
                      <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {f.name}
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-400 mt-0.5">{f.size}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import { IdeaStatus } from '../types';
import { Plus, Search, Lightbulb } from 'lucide-react';
import { IdeaCard } from '../components/ideas/IdeaCard';
import { EmptyState } from '../components/common/EmptyState';

export const IdeasPage: React.FC = () => {
  const { ideas, openIdeaModal } = useJourney();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const statusTabs: { id: string; label: string }[] = [
    { id: 'all', label: 'All Ideas' },
    { id: 'idea', label: 'Raw Sparks' },
    { id: 'planning', label: 'Planning' },
    { id: 'building', label: 'Building' },
    { id: 'project', label: 'Converted to Project' },
    { id: 'completed', label: 'Completed' },
  ];

  const filteredIdeas = ideas.filter((idea) => {
    if (statusFilter !== 'all' && idea.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = idea.title.toLowerCase().includes(q);
      const matchDesc = idea.description.toLowerCase().includes(q);
      const matchCat = idea.category.toLowerCase().includes(q);
      const matchTags = (idea.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCat && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Idea Vault
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Don&rsquo;t let good ideas disappear. Incubate and convert them into projects.
          </p>
        </div>

        <button
          onClick={() => openIdeaModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Idea</span>
        </button>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                    : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Your idea vault is empty"
          description="Capture your next idea before it disappears. You can develop it further and convert it to a project anytime."
          actionLabel="Capture Idea"
          onAction={() => openIdeaModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Idea } from '../../types';
import { useJourney } from '../../context/JourneyContext';
import { IdeaDetailModal } from './IdeaDetailModal';
import { openIdeaInNewTab } from '../../utils/tabUtils';
import {
  Lightbulb,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  FolderGit2,
  Calendar,
  Eye,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
  onSelect?: (idea: Idea) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onSelect }) => {
  const {
    convertIdeaToProject,
    openIdeaModal,
    requestDelete,
    deleteIdea,
    projects,
    navigateTo,
  } = useJourney();

  const [menuOpen, setMenuOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const linkedProject = projects.find((p) => p.id === idea.relatedProjectId);

  const getStatusLabel = (status: Idea['status']) => {
    switch (status) {
      case 'idea':
        return 'Raw Idea';
      case 'planning':
        return 'Planning';
      case 'building':
        return 'Building';
      case 'project':
        return 'Active Project';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: Idea['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/60';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/60';
      default:
        return 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700';
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(idea);
    } else {
      setDetailOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col justify-between p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-xs hover:shadow-md cursor-pointer select-none"
      >
        <div>
          {/* Top Info + Menu */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60">
                {getStatusLabel(idea.status)}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-semibold border ${getPriorityColor(
                  idea.priority
                )}`}
              >
                {idea.priority}
              </span>
              <span className="text-neutral-400 font-mono text-[10px]">
                {idea.category}
              </span>
            </div>

            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openIdeaInNewTab(idea);
                }}
                className="p-1 rounded text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Open in new tab"
                aria-label="Open idea in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Idea options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-44 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-1 z-20"
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setDetailOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left font-medium"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-500" />
                      <span>View Clearly</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        openIdeaInNewTab(idea);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                      <span>Open in New Tab</span>
                    </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      openIdeaModal(idea.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Edit Idea</span>
                  </button>
                  {idea.status !== 'project' && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        convertIdeaToProject(idea.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left font-medium"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Convert to Project</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      requestDelete({
                        title: 'Delete Idea?',
                        message: `Are you sure you want to remove "${idea.title}"?`,
                        confirmLabel: 'Delete Idea',
                        onConfirm: () => deleteIdea(idea.id),
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
          </div>

          <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {idea.title}
          </h4>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
            {idea.description}
          </p>

          {idea.tags && idea.tags.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-3 flex-wrap">
              {idea.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400"
                >
                  #{t}
                </span>
              ))}
              {idea.tags.length > 4 && (
                <span className="text-[10px] text-neutral-400 font-mono">
                  +{idea.tags.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3.5 border-t border-neutral-150 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
            <Calendar className="w-3 h-3" />
            <span>{idea.createdAt ? idea.createdAt.slice(0, 10) : 'Recent'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDetailOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 transition-colors cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </button>

            {linkedProject ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo('project-detail', linkedProject.id);
                }}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                <span>Project</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  convertIdeaToProject(idea.id);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                title="Convert to project"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Idea Detail Modal */}
      <IdeaDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        idea={idea}
      />
    </>
  );
};

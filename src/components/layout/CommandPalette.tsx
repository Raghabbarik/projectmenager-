import React, { useState, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  LayoutDashboard,
  CalendarDays,
  FolderGit2,
  Lightbulb,
  LineChart,
  GitCommit,
  Search,
  Building2,
  KeyRound,
  FileText,
  Paperclip,
  Sparkles,
  Settings,
  PlusCircle,
  X,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { ViewRoute } from '../../types';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    navigateTo,
    openActivityModal,
    openProjectModal,
    openIdeaModal,
    openNoteModal,
    projects,
    ideas,
    notes,
  } = useJourney();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const quickNavItems: { label: string; route: ViewRoute; icon: any; category: string }[] = [
    { label: 'Dashboard', route: 'dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { label: 'Daily Activity Journal', route: 'daily', icon: CalendarDays, category: 'Navigation' },
    { label: 'Projects & Workflows', route: 'projects', icon: FolderGit2, category: 'Navigation' },
    { label: 'Idea Vault', route: 'ideas', icon: Lightbulb, category: 'Navigation' },
    { label: 'Growth & Analytics', route: 'growth', icon: LineChart, category: 'Navigation' },
    { label: 'Journey Timeline', route: 'timeline', icon: GitCommit, category: 'Navigation' },
    { label: 'Global Search', route: 'search', icon: Search, category: 'Navigation' },
    { label: 'Clients Directory', route: 'clients', icon: Building2, category: 'Navigation' },
    { label: 'Accounts & Services', route: 'accounts', icon: KeyRound, category: 'Navigation' },
    { label: 'Notes & Knowledge', route: 'notes', icon: FileText, category: 'Navigation' },
    { label: 'Files & Assets', route: 'files', icon: Paperclip, category: 'Navigation' },
    { label: 'Student Sheet Mailer', route: 'student-mailer', icon: GraduationCap, category: 'Navigation' },
    { label: 'AI Assistant', route: 'ai-assistant', icon: Sparkles, category: 'Navigation' },
    { label: 'Settings & Privacy', route: 'settings', icon: Settings, category: 'Navigation' },
  ];

  const quickActionItems = [
    {
      label: 'Record New Activity',
      action: () => openActivityModal(),
      icon: PlusCircle,
      category: 'Actions',
    },
    {
      label: 'Create New Project',
      action: () => openProjectModal(),
      icon: PlusCircle,
      category: 'Actions',
    },
    {
      label: 'Capture New Idea',
      action: () => openIdeaModal(),
      icon: PlusCircle,
      category: 'Actions',
    },
    {
      label: 'Write New Note',
      action: () => openNoteModal(),
      icon: PlusCircle,
      category: 'Actions',
    },
  ];

  const filteredNav = quickNavItems.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = quickActionItems.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const matchedProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const matchedIdeas = ideas.filter((i) =>
    i.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectNav = (route: ViewRoute) => {
    navigateTo(route);
    setCommandPaletteOpen(false);
  };

  const handleSelectAction = (fn: () => void) => {
    setCommandPaletteOpen(false);
    fn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Type a command, page, project, or search your journey..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded">
              ESC
            </kbd>
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {filteredActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAction(action.action)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <action.icon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{action.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Navigation
              </div>
              <div className="space-y-0.5">
                {filteredNav.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectNav(item.route)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      Jump to page
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects matched */}
          {query.trim().length > 0 && matchedProjects.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Projects
              </div>
              <div className="space-y-0.5">
                {matchedProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigateTo('project-detail', p.id);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {p.progress}% done
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ideas matched */}
          {query.trim().length > 0 && matchedIdeas.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Ideas
              </div>
              <div className="space-y-0.5">
                {matchedIdeas.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => {
                      navigateTo('ideas', i.id);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-medium">{i.title}</span>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {i.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && matchedProjects.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
              No matching commands or entries for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
          <span>Navigation: ↑ ↓ Enter</span>
          <span>Close: ESC</span>
        </div>
      </div>
    </div>
  );
};

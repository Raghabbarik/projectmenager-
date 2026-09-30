import React from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Compass,
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
  Plus,
  Moon,
  Sun,
  ShieldCheck,
  Download,
  PanelLeftClose,
  X,
  LogOut,
  Lock,
  Mail,
  Globe,
  User,
  Users,
  GraduationCap,
} from 'lucide-react';

import { ViewRoute } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    openQuickAdd,
    user,
    toggleTheme,
    activities,
    visibleProjects,
    visibleClients,
    isMember,
    logoutUser,
    ideas,
    sidebarOpen,
    setSidebarOpen,
    unreadMessagesCount,
    openPublicEditor,
  } = useJourney();

  const handleNavClick = (id: ViewRoute) => {
    navigateTo(id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const adminMainNav: { id: ViewRoute; label: string; icon: any; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Daily', icon: CalendarDays, count: activities.filter(a => a.date === todayStr).length },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderGit2,
      count: visibleProjects.filter(p => p.status === 'in_progress').length,
    },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb, count: ideas.length },
    { id: 'growth', label: 'Growth', icon: LineChart },
    { id: 'timeline', label: 'Project Timeline', icon: GitCommit },
    { id: 'personal-timeline', label: 'Personal Timeline', icon: User },
    { id: 'search', label: 'Search', icon: Search },
  ];

  const adminSecondaryNav: { id: ViewRoute; label: string; icon: any; count?: number }[] = [
    { id: 'team-members', label: 'Team Members', icon: Users },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'messages', label: 'Messages', icon: Mail, count: unreadMessagesCount },
    { id: 'accounts', label: 'Accounts', icon: KeyRound },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Files', icon: Paperclip },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'home', label: 'Public Website', icon: Globe },
  ];

  const memberNav: { id: ViewRoute; label: string; icon: any; count?: number }[] = [
    {
      id: 'projects',
      label: 'Client Projects',
      icon: FolderGit2,
      count: visibleProjects.length,
    },
    {
      id: 'clients',
      label: 'Allocated Clients',
      icon: Building2,
      count: visibleClients.length,
    },
    {
      id: 'timeline',
      label: 'Client Project Timeline',
      icon: GitCommit,
    },
    {
      id: 'personal-timeline',
      label: 'My Personal Timeline',
      icon: User,
    },
    {
      id: 'messages',
      label: 'Admin Messages',
      icon: Mail,
      count: unreadMessagesCount,
    },
    {
      id: 'home',
      label: 'Public Website',
      icon: Globe,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container with smooth collapse / expand */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          h-screen bg-white dark:bg-neutral-950 shrink-0 select-none
          transition-[width,transform] duration-300 ease-in-out
          ${
            sidebarOpen
              ? 'translate-x-0 w-64 border-r border-neutral-200 dark:border-neutral-800 shadow-2xl lg:shadow-none'
              : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 overflow-hidden pointer-events-none'
          }
        `}
      >
        <div className="w-64 h-full flex flex-col overflow-hidden">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
            <button
              onClick={() => handleNavClick(isMember ? 'projects' : 'dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer min-w-0"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Compass className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="truncate">
                <div className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 truncate">
                  <span>{isMember ? 'Member Portal' : 'My Journey'}</span>
                </div>
                <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal truncate">
                  {isMember ? 'Allocated Client Workspace' : 'Private Life OS'}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={toggleTheme}
                title="Toggle Theme"
                className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                {user.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                title="Close sidebar (Ctrl+B)"
                aria-label="Close sidebar"
                className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4 hidden lg:block" />
                <X className="w-4 h-4 lg:hidden" />
              </button>
            </div>
          </div>

          {/* Quick Add CTA (Admin only) or Member Scope Callout */}
          <div className="px-3 pt-3 pb-2 space-y-2 shrink-0">
            {isMember ? (
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Restricted Scope</span>
                </div>
                <div className="text-[11px] leading-relaxed text-emerald-700/90 dark:text-emerald-300/80">
                  Access limited to allocated clients and associated deliverables.
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  openQuickAdd('activity');
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-[#e5e5cb] dark:text-[#1a120b] hover:bg-neutral-800 dark:hover:bg-[#d5cea3] transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Record Activity</span>
              </button>
            )}
          </div>

          {/* Nav Section */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
            {isMember ? (
              /* Member Navigation: Only Clients & Projects */
              <div>
                <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Allocated Work
                </div>
                <nav className="space-y-1">
                  {memberNav.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      currentRoute === item.id ||
                      (item.id === 'projects' && currentRoute === 'project-detail') ||
                      (item.id === 'clients' && currentRoute === 'client-detail');

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-neutral-100 dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 stroke-[1.75] ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400 dark:text-neutral-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.count !== undefined && item.count > 0 && (
                          <span className="text-[11px] font-mono tabular-nums text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ) : (
              /* Admin Navigation: Full System */
              <>
                <div>
                  <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Workspace
                  </div>
                  <nav className="space-y-0.5">
                    {adminMainNav.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentRoute === item.id || (item.id === 'projects' && currentRoute === 'project-detail');
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-neutral-100 dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 font-semibold'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`w-4 h-4 shrink-0 stroke-[1.75] ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400 dark:text-neutral-500'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.count !== undefined && item.count > 0 && (
                            <span className="text-[11px] font-mono tabular-nums text-neutral-400 dark:text-neutral-500">
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div>
                  <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Management & Archive
                  </div>
                  <nav className="space-y-0.5">
                    {adminSecondaryNav.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentRoute === item.id || (item.id === 'clients' && currentRoute === 'client-detail');
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-neutral-100 dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 font-semibold'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`w-4 h-4 shrink-0 stroke-[1.75] ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400 dark:text-neutral-500'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.count !== undefined && item.count > 0 && (
                            <span className="text-[10px] font-mono font-bold bg-indigo-500 text-white px-1.5 py-0.2 rounded-full">
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {/* Admin CMS Quick Action */}
                    <button
                      onClick={() => openPublicEditor('home')}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      title="Edit Public Website Content (Admin CMS)"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                        <span className="truncate">Public Site CMS</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                        EDIT
                      </span>
                    </button>
                  </nav>
                </div>

                {/* Dedicated Student Outreach & Sheet Mailer Section */}
                <div>
                  <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Student Outreach</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      NEW
                    </span>
                  </div>
                  <nav className="space-y-0.5">
                    <button
                      onClick={() => handleNavClick('student-mailer')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        currentRoute === 'student-mailer'
                          ? 'bg-neutral-100 dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <GraduationCap
                          className={`w-4 h-4 shrink-0 stroke-[1.75] ${
                            currentRoute === 'student-mailer'
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-neutral-400 dark:text-neutral-500'
                          }`}
                        />
                        <span className="truncate">Student Sheet Mailer</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-indigo-500 text-white px-1.5 py-0.2 rounded-full">
                        Sheets
                      </span>
                    </button>
                  </nav>
                </div>
              </>
            )}
          </div>

          {/* Privacy Marker & User Mini Profile */}
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2 shrink-0">
            <div className="flex items-center justify-between px-2 text-[10px] text-neutral-400 dark:text-neutral-500">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">Supabase: Live Connected</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Postgres</span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-150 dark:border-neutral-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-[11px] font-bold text-white shadow-xs shrink-0">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {user.name}
                    </span>
                    <span
                      className={`text-[8px] px-1 py-0.2 rounded font-mono font-semibold uppercase shrink-0 ${
                        isMember
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {isMember ? 'Member' : 'Admin'}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate font-mono">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={() => logoutUser()}
                title="Sign out"
                className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

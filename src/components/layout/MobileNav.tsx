import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  LayoutDashboard,
  CalendarDays,
  FolderGit2,
  Lightbulb,
  LineChart,
  Plus,
  Menu,
  X,
  GitCommit,
  Building2,
  KeyRound,
  FileText,
  Paperclip,
  Sparkles,
  Settings,
  Download,
  Moon,
  Sun,
  Mail,
  User,
  GraduationCap,
} from 'lucide-react';
import { ViewRoute } from '../../types';

export const MobileNav: React.FC = () => {
  const { currentRoute, navigateTo, openQuickAdd, toggleTheme, user, isMember } = useJourney();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const primaryTabs: { id: ViewRoute; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'daily', label: 'Daily', icon: CalendarDays },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb },
    { id: 'growth', label: 'Growth', icon: LineChart },
  ];

  const drawerItems: { id: ViewRoute; label: string; icon: any }[] = [
    { id: 'timeline', label: 'Project Timeline', icon: GitCommit },
    { id: 'personal-timeline', label: 'Personal Timeline', icon: User },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'accounts', label: 'Accounts', icon: KeyRound },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Files & Assets', icon: Paperclip },
    { id: 'student-mailer', label: 'Student Sheet Mailer', icon: GraduationCap },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (route: ViewRoute) => {
    navigateTo(route);
    setDrawerOpen(false);
  };

  if (isMember) {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => handleNav('projects')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentRoute === 'projects' || currentRoute === 'project-detail'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <FolderGit2 className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[9px] mt-0.5">Projects</span>
        </button>

        <button
          onClick={() => handleNav('clients')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentRoute === 'clients' || currentRoute === 'client-detail'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <Building2 className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[9px] mt-0.5">Clients</span>
        </button>

        <button
          onClick={() => handleNav('timeline')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentRoute === 'timeline'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <GitCommit className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[9px] mt-0.5">Work Timeline</span>
        </button>

        <button
          onClick={() => handleNav('personal-timeline')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentRoute === 'personal-timeline'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <User className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[9px] mt-0.5">Personal</span>
        </button>

        <button
          onClick={() => handleNav('messages')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentRoute === 'messages'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <Mail className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[9px] mt-0.5">Messages</span>
        </button>
      </nav>
    );
  }

  return (
    <>
      {/* Bottom Sticky Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-2 py-1.5 flex items-center justify-around">
        {primaryTabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNav(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[1.8]" />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* Center Floating Plus Action */}
        <button
          onClick={() => openQuickAdd()}
          className="w-10 h-10 -mt-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-lg transition-transform active:scale-95"
          title="Quick Add"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {primaryTabs.slice(2, 4).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.id || (tab.id === 'projects' && currentRoute === 'project-detail');
          return (
            <button
              key={tab.id}
              onClick={() => handleNav(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[1.8]" />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* More Drawer Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
            drawerOpen ? 'text-indigo-600' : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <Menu className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-72 bg-white dark:bg-neutral-900 h-full p-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-4">
                <div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    My Journey
                  </div>
                  <div className="text-[10px] text-neutral-400">Navigation Menu</div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {/* Growth link */}
                <button
                  onClick={() => handleNav('growth')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                    currentRoute === 'growth'
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <LineChart className="w-4 h-4" />
                  <span>Growth & Analytics</span>
                </button>

                {drawerItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                        isActive
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 font-semibold'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500">Theme</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
              >
                {user.theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

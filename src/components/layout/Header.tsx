import React, { useState, useRef, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Search,
  Bell,
  Plus,
  Check,
  Calendar,
  LogOut,
  User,
  Settings as SettingsIcon,
  Sparkles,
  Command,
  ChevronRight,
  Database,
  Sun,
  Moon,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Mail,
} from 'lucide-react';
import { MemberManagementModal } from '../members/MemberManagementModal';

export const Header: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    setCommandPaletteOpen,
    openQuickAdd,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    user,
    projects,
    selectedProjectId,
    resetToSampleData,
    toggleTheme,
    userRole,
    isAdmin,
    isMember,
    logoutUser,
    sidebarOpen,
    toggleSidebar,
    unreadMessagesCount,
    openPublicEditor,
  } = useJourney();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbTitle = () => {
    switch (currentRoute) {
      case 'dashboard':
        return 'Dashboard';
      case 'daily':
        return 'Daily Journal';
      case 'projects':
        return 'Projects';
      case 'project-detail': {
        const currentProject = projects.find((p) => p.id === selectedProjectId);
        return currentProject ? currentProject.name : 'Project Details';
      }
      case 'ideas':
        return 'Idea Vault';
      case 'growth':
        return 'Growth & Analytics';
      case 'timeline':
        return 'Project & Client Timeline';
      case 'personal-timeline':
        return 'My Personal Timeline';
      case 'clients':
        return 'Clients';
      case 'client-detail':
        return 'Client Details';
      case 'messages':
        return 'Messages';
      case 'accounts':
        return 'Account Tracker';
      case 'notes':
        return 'Notes';
      case 'files':
        return 'Files & Assets';
      case 'search':
        return 'Global Search';
      case 'ai-assistant':
        return 'AI Assistant';
      case 'settings':
        return 'Settings';
      case 'export':
        return 'Export Data';
      case 'team-members':
        return 'Team Members';
      case 'student-mailer':
        return 'Student Sheet Mailer';
      default:
        return 'My Journey';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
      {/* Zone 1: Sidebar Toggle & Contextual Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 min-w-0">
        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Close sidebar (Ctrl+B)' : 'Open sidebar (Ctrl+B)'}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="p-1.5 -ml-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 hidden lg:block" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 hidden lg:block" />
          )}
          <Menu className="w-4 h-4 lg:hidden" />
        </button>

        <button
          onClick={() => navigateTo(isMember ? 'projects' : 'dashboard')}
          className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-medium truncate shrink-0 cursor-pointer"
        >
          {isMember ? 'Member Portal' : 'My Journey'}
        </button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* Zone 2: Universal Search Trigger (Center) */}
      {!isMember ? (
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100/70 dark:bg-neutral-900/70 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search your journey...</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-neutral-400 bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Add Button (Admin only) */}
        {!isMember && (
          <button
            onClick={() => openQuickAdd()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-[#e5e5cb] dark:text-[#1a120b] hover:bg-neutral-800 dark:hover:bg-[#d5cea3] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add</span>
          </button>
        )}

        {/* Admin Public Site CMS Quick Button (Admin only) */}
        {isAdmin && (
          <button
            onClick={() => openPublicEditor('home')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 transition-colors shadow-xs cursor-pointer"
            title="Edit Public Website CMS (Admin Only)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Public Site CMS</span>
          </button>
        )}

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={user.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
        >
          {user.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-600" />
          )}
        </button>

        {/* In-App Messages Center Button */}
        <button
          onClick={() => navigateTo('messages')}
          className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
          title="Team Messages & Communication"
        >
          <Mail className="w-4 h-4" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[16px] h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen((prev) => !prev)}
            className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 text-left transition-colors cursor-pointer ${
                        !n.read
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {user.name}
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase ${
                      isMember
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    {isMember ? 'Client Member' : 'Admin'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                  {user.email}
                </div>
              </div>

              {!isMember ? (
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigateTo('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Account & Preferences</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setMemberModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer font-medium"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Team Members & Allocations</span>
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        openPublicEditor('home');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 text-left transition-colors cursor-pointer font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Edit Public Website (CMS)</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigateTo('ai-assistant');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Assistant Preview</span>
                  </button>
                  <button
                    onClick={() => {
                      resetToSampleData();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sync Supabase Live Database</span>
                  </button>
                </div>
              ) : null}

              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                <button
                  onClick={() => {
                    logoutUser();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-rose-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Member Management Modal */}
      <MemberManagementModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
      />
    </>
  );
};

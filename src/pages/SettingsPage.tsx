import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  User,
  Moon,
  Sun,
  Laptop,
  Bell,
  Shield,
  Download,
  Database,
  Trash2,
  Check,
  LogOut,
  Users,
  UserPlus,
  KeyRound,
  Building2,
  FolderGit2,
  ArrowRight,
  Mail,
  Globe,
  Sparkles,
} from 'lucide-react';
import { MemberManagementModal } from '../components/members/MemberManagementModal';
import { SendMessageModal } from '../components/messages/SendMessageModal';
import { RedisCachePanel } from '../components/redis/RedisCachePanel';
import { SmtpSettingsCard } from '../components/settings/SmtpSettingsCard';

export const SettingsPage: React.FC = () => {
  const {
    user,
    settings,
    updateUser,
    updateSettings,
    exportData,
    resetToSampleData,
    requestDelete,
    showToast,
    isAdmin,
    teamMembers,
    clients,
    projects,
    loginUser,
    navigateTo,
    openPublicEditor,
    publicContent,
  } = useJourney();

  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: nameInput, email: emailInput });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Settings & Preferences
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage your personal profile, notification triggers, privacy controls, and data exports
        </p>
      </div>

      {/* Admin: Team Members & Client/Project Allocation Section */}
      {isAdmin && (
        <section className="p-6 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-neutral-50/40 dark:from-indigo-950/20 dark:via-neutral-900/60 dark:to-neutral-900/40 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Team Members & Client Allocation
                </h2>
                <p className="text-xs text-neutral-500">
                  Allocate members to specific clients and projects with dedicated login credentials.
                </p>
              </div>
            </div>

            <button
              onClick={() => setMemberModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 dark:bg-[#e5e5cb] hover:bg-indigo-700 dark:hover:bg-[#d5cea3] text-white dark:text-[#1a120b] transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Allocate New Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teamMembers.map((member) => {
              const isOwner = member.role === 'admin';
              const assignedClients = clients.filter((c) =>
                (member.assignedClientIds || []).includes(c.id)
              );
              const assignedProjs = projects.filter((p) =>
                (member.assignedProjectIds || []).includes(p.id)
              );

              return (
                <div
                  key={member.id}
                  className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {member.name}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400 truncate">
                            {member.email}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold uppercase shrink-0 ${
                          isOwner
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {isOwner ? 'Admin' : 'Member'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neutral-500 font-mono">
                      <KeyRound className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>Password: {member.password || 'password123'}</span>
                    </div>

                    {!isOwner && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {assignedClients.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                          >
                            <Building2 className="w-2.5 h-2.5" />
                            <span>{c.company}</span>
                          </span>
                        ))}
                        {assignedProjs.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60"
                          >
                            <FolderGit2 className="w-2.5 h-2.5" />
                            <span>{p.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMemberModalOpen(true)}
                        className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        Allocations
                      </button>
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <button
                        onClick={() => {
                          setMessageRecipient(member.email);
                          setMessageModalOpen(true);
                        }}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                    </div>

                    <button
                      onClick={() => loginUser(member.email, member.password)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      <span>Switch to View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Admin Exclusive: Public Website CMS Editor Section */}
      {isAdmin && (
        <section className="p-6 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-neutral-50/40 dark:from-indigo-950/20 dark:via-neutral-900/60 dark:to-neutral-900/40 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Public Website CMS
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                    Admin Only
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Only Administrators have privileges to customize the headlines, copy, features, and FAQs on the public website.
                </p>
              </div>
            </div>

            <button
              onClick={() => openPublicEditor('home')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 dark:bg-[#e5e5cb] hover:bg-indigo-700 dark:hover:bg-[#d5cea3] text-white dark:text-[#1a120b] transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Public CMS Editor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Home Page Card */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Home Landing Page
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Published
                </span>
              </div>
              <p className="text-xs text-neutral-500 line-clamp-2">
                {publicContent.home.heroTitle} {publicContent.home.heroGradientTitle}
              </p>
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => openPublicEditor('home')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Edit Copy →
                </button>
                <button
                  onClick={() => navigateTo('home')}
                  className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  View Page
                </button>
              </div>
            </div>

            {/* About Page Card */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  About Philosophy Page
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Published
                </span>
              </div>
              <p className="text-xs text-neutral-500 line-clamp-2">
                {publicContent.about.title} {publicContent.about.gradientTitle}
              </p>
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => openPublicEditor('about')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Edit Copy →
                </button>
                <button
                  onClick={() => navigateTo('about')}
                  className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  View Page
                </button>
              </div>
            </div>

            {/* Contact Page Card */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Contact & Support Page
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Published
                </span>
              </div>
              <p className="text-xs text-neutral-500 line-clamp-2">
                Support: {publicContent.contact.supportEmail}
              </p>
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => openPublicEditor('contact')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Edit Copy →
                </button>
                <button
                  onClick={() => navigateTo('contact')}
                  className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  View Page
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Member Management Modal */}
      <MemberManagementModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
      />

      {/* 1. Profile Section */}
      <section className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <User className="w-4 h-4 text-neutral-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Personal Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-lg font-bold text-white shadow-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {user.name}
              </div>
              <div className="text-xs text-neutral-500">
                Local Profile · 100% Private Data
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-[#e5e5cb] dark:text-[#1a120b] hover:bg-neutral-800 dark:hover:bg-[#d5cea3] transition-colors shadow-xs cursor-pointer"
          >
            Save Profile
          </button>
        </form>
      </section>

      {/* 2. Appearance Section */}
      <section className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <Sun className="w-4 h-4 text-neutral-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Appearance & Theme
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {[
            { id: 'light' as const, label: 'Light', icon: Sun },
            { id: 'dark' as const, label: 'Dark', icon: Moon },
            { id: 'system' as const, label: 'System', icon: Laptop },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = user.theme === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  updateUser({ theme: mode.id });
                  updateSettings({ theme: mode.id });
                }}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1.5" />
                <span className="text-xs">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Direct Email & SMTP Platform Dispatch */}
      <SmtpSettingsCard />

      {/* 4. Notifications Section */}
      <section className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <Bell className="w-4 h-4 text-neutral-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Notification Alerts
          </h2>
        </div>

        <div className="space-y-3 max-w-lg">
          {[
            {
              key: 'dailyReminder' as const,
              title: 'Daily Journey Recording Reminder',
              desc: 'Gentle notification in the evening if you have not recorded today.',
            },
            {
              key: 'deadlineReminder' as const,
              title: 'Project Deadline Alert',
              desc: 'Notice 48 hours before target project milestones.',
            },
            {
              key: 'taskReminder' as const,
              title: 'Pending Task Digest',
              desc: 'Remind about incomplete items in active projects.',
            },
            {
              key: 'weeklySummary' as const,
              title: 'Weekly Progress Review',
              desc: 'Sunday evening overview of activities and time logged.',
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start justify-between gap-3 p-3 rounded-lg border border-neutral-150 dark:border-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 cursor-pointer"
            >
              <div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.title}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={() => updateSettings({ [item.key]: !settings[item.key] })}
                className="mt-1 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          ))}
        </div>
      </section>

      {/* 4. Privacy & Data Autonomy Export Center */}
      <section className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <Shield className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Privacy & Data Autonomy (Export)
          </h2>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
          Your life, progress, and thoughts belong exclusively to you. You can export complete machine-readable copies of your activities, projects, ideas, and notes anytime in CSV or JSON.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 max-w-xl">
          <button
            onClick={() => exportData('csv', 'activities')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Activities (CSV)</span>
          </button>

          <button
            onClick={() => exportData('csv', 'projects')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Projects (CSV)</span>
          </button>

          <button
            onClick={() => exportData('json', 'all')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Complete Journey (JSON)</span>
          </button>
        </div>
      </section>

      {/* 5. Centralized Redis Shared Cache */}
      <section className="space-y-4">
        <RedisCachePanel />
      </section>

      {/* 6. Backup & Maintenance */}
      <section className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <Database className="w-4 h-4 text-neutral-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Backup & Reset Operations
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Restore Realistic Sample Data
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Refreshes initial projects, activities, ideas, and timeline entries.
            </div>
          </div>
          <button
            onClick={() => resetToSampleData()}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-[#e5e5cb] dark:text-[#1a120b] hover:bg-neutral-800 dark:hover:bg-[#d5cea3] transition-colors shadow-xs cursor-pointer"
          >
            Restore Seed Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10">
          <div>
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Purge All Local Records
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Permanently clears localStorage for this browser session.
            </div>
          </div>
          <button
            onClick={() =>
              requestDelete({
                title: 'Clear All Journey Data?',
                message:
                  'This will erase all recorded activities, projects, notes, and ideas from local storage. Are you sure?',
                confirmLabel: 'Clear All Data',
                onConfirm: () => {
                  localStorage.clear();
                  resetToSampleData();
                  showToast('Storage wiped and initialized', 'warning');
                },
              })
            }
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
          >
            Clear Data
          </button>
        </div>
      </section>

      {/* Account Session Switching */}
      <div className="pt-4 flex items-center justify-between">
        <button
          onClick={() => navigateTo('login')}
          className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Account / Sign In</span>
        </button>

        <span className="text-[11px] text-neutral-400 font-mono">
          My Journey v1.0.0 · Private Personal OS
        </span>
      </div>

      {/* Send Message Modal */}
      <SendMessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        prefillRecipientId={messageRecipient}
      />
    </div>
  );
};

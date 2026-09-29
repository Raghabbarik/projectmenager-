import React from 'react';
import { JourneyProvider, useJourney } from './context/JourneyContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { QuickAddModal } from './components/common/QuickAddModal';
import { ToastContainer } from './components/common/Toast';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ActivityFormModal } from './components/activities/ActivityFormModal';
import { ProjectFormModal } from './components/projects/ProjectFormModal';
import { IdeaFormModal } from './components/ideas/IdeaFormModal';
import { NoteFormModal } from './components/notes/NoteFormModal';
import { ClientFormModal } from './components/clients/ClientFormModal';
import { AccountFormModal } from './components/accounts/AccountFormModal';

// Public Landing Pages & Layout
import { PublicHeader } from './components/layout/PublicHeader';
import { PublicFooter } from './components/layout/PublicFooter';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PublicSiteEditorModal } from './components/admin/PublicSiteEditorModal';
import { MilestoneModal } from './components/modals/MilestoneModal';

// Workspace App Pages
import { DashboardPage } from './pages/DashboardPage';
import { DailyPage } from './pages/DailyPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { IdeasPage } from './pages/IdeasPage';
import { GrowthPage } from './pages/GrowthPage';
import { TimelinePage } from './pages/TimelinePage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { MessagesPage } from './pages/MessagesPage';
import { AccountsPage } from './pages/AccountsPage';
import { NotesPage } from './pages/NotesPage';
import { FilesPage } from './pages/FilesPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { AdminMembersPage } from './pages/AdminMembersPage';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  OnboardingPage,
} from './pages/AuthPages';

const AppContent: React.FC = () => {
  const { currentRoute, authLoading } = useJourney();

  // Show loading screen while Supabase session is being resolved.
  // This prevents the white blank page on fresh load / page refresh.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">My Journey</span>
            </div>
            <span className="text-xs text-neutral-400">Checking session...</span>
          </div>
        </div>
      </div>
    );
  }

  // 1. Public Marketing / Landing Pages (Home, About, Contact)
  if (currentRoute === 'home') {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased font-sans">
        <PublicHeader />
        <main className="flex-1">
          <HomePage />
        </main>
        <PublicFooter />
        <PublicSiteEditorModal />
        <MilestoneModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentRoute === 'about') {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased font-sans">
        <PublicHeader />
        <main className="flex-1">
          <AboutPage />
        </main>
        <PublicFooter />
        <PublicSiteEditorModal />
        <MilestoneModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentRoute === 'contact') {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased font-sans">
        <PublicHeader />
        <main className="flex-1">
          <ContactPage />
        </main>
        <PublicFooter />
        <PublicSiteEditorModal />
        <MilestoneModal />
        <ToastContainer />
      </div>
    );
  }

  // 2. Auth pages render without main workspace app layout
  if (currentRoute === 'login') {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  if (currentRoute === 'register') {
    return (
      <>
        <RegisterPage />
        <ToastContainer />
      </>
    );
  }

  if (currentRoute === 'forgot-password') {
    return (
      <>
        <ForgotPasswordPage />
        <ToastContainer />
      </>
    );
  }

  if (currentRoute === 'onboarding') {
    return (
      <>
        <OnboardingPage />
        <ToastContainer />
      </>
    );
  }

  // 3. Workspace Application Pages
  const renderActiveRoute = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardPage />;
      case 'daily':
        return <DailyPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'project-detail':
        return <ProjectDetailPage />;
      case 'ideas':
        return <IdeasPage />;
      case 'growth':
        return <GrowthPage />;
      case 'timeline':
        return <TimelinePage defaultStream="projects" />;
      case 'personal-timeline':
        return <TimelinePage defaultStream="personal" />;
      case 'clients':
        return <ClientsPage />;
      case 'client-detail':
        return <ClientDetailPage />;
      case 'messages':
        return <MessagesPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'notes':
        return <NotesPage />;
      case 'files':
        return <FilesPage />;
      case 'search':
        return <SearchPage />;
      case 'ai-assistant':
        return <AiAssistantPage />;
      case 'settings':
      case 'export':
        return <SettingsPage />;
      case 'team-members':
        return <AdminMembersPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Viewport */}
      <div className="flex flex-col flex-1 h-screen min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 lg:pb-8">
          {renderActiveRoute()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Overlays & Dialogs */}
      <CommandPalette />
      <QuickAddModal />
      <ActivityFormModal />
      <ProjectFormModal />
      <IdeaFormModal />
      <NoteFormModal />
      <ClientFormModal />
      <AccountFormModal />
      <PublicSiteEditorModal />
      <MilestoneModal />
      <DeleteConfirmModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <JourneyProvider>
        <AppContent />
      </JourneyProvider>
    </ErrorBoundary>
  );
}

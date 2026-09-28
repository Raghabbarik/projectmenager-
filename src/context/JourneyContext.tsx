import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Activity,
  Project,
  Task,
  Milestone,
  MilestoneCategory,
  MilestoneStatus,
  Idea,
  Client,
  AccountTracker,
  Note,
  FileAttachment,
  AppNotification,
  UserProfile,
  UserSettings,
  ViewRoute,
  ActivityType,
  PlanFile,
  TeamMember,
  UserRole,
  TeamMessage,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_SETTINGS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_MILESTONES,
  INITIAL_ACTIVITIES,
  INITIAL_IDEAS,
  INITIAL_CLIENTS,
  INITIAL_ACCOUNTS,
  INITIAL_NOTES,
  INITIAL_FILES,
  INITIAL_NOTIFICATIONS,
  INITIAL_MEMBERS,
  INITIAL_MESSAGES,
} from '../data/mockData';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { DEFAULT_PUBLIC_CONTENT, PublicSiteContent } from '../data/defaultPublicContent';
import { deleteFileBlob } from '../services/fileStorageService';
import { redisService } from '../services/redisService';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface DeleteConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface JourneyContextType {
  // Navigation & Selection
  currentRoute: ViewRoute;
  selectedProjectId: string | null;
  selectedClientId: string | null;
  selectedIdeaId: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  navigateTo: (route: ViewRoute, id?: string) => void;

  // Data States
  user: UserProfile;
  settings: UserSettings;
  activities: Activity[];
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  ideas: Idea[];
  clients: Client[];
  accounts: AccountTracker[];
  notes: Note[];
  files: FileAttachment[];
  notifications: AppNotification[];

  // Modals & UI Controls
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  quickAddDefaultType: 'activity' | 'project' | 'idea' | 'note' | 'task';
  openQuickAdd: (type?: 'activity' | 'project' | 'idea' | 'note' | 'task') => void;

  // Daily Completion Tracker & Progress
  completedDays: Record<string, boolean>;
  toggleDayComplete: (dateStr?: string) => void;
  isDayCompleted: (dateStr?: string) => boolean;

  // Project Plan Files
  addProjectPlanFile: (projectId: string, file: { name: string; type: string; size?: string; url?: string; fileData?: string }) => void;
  removeProjectPlanFile: (projectId: string, fileId: string) => void;

  // Form Modals
  activityModal: { isOpen: boolean; initialData?: Partial<Activity>; editId?: string };
  openActivityModal: (initialData?: Partial<Activity>, editId?: string) => void;
  closeActivityModal: () => void;

  projectModal: { isOpen: boolean; editId?: string; prefillFromIdea?: Idea; prefillClientId?: string };
  openProjectModal: (editId?: string, prefillFromIdea?: Idea, prefillClientId?: string) => void;
  closeProjectModal: () => void;

  ideaModal: { isOpen: boolean; editId?: string };
  openIdeaModal: (editId?: string) => void;
  closeIdeaModal: () => void;

  noteModal: { isOpen: boolean; editId?: string };
  openNoteModal: (editId?: string) => void;
  closeNoteModal: () => void;

  clientModal: { isOpen: boolean; editId?: string };
  openClientModal: (editId?: string) => void;
  closeClientModal: () => void;

  accountModal: { isOpen: boolean; editId?: string };
  openAccountModal: (editId?: string) => void;
  closeAccountModal: () => void;

  deleteConfirm: DeleteConfirmConfig;
  requestDelete: (config: Omit<DeleteConfirmConfig, 'isOpen'>) => void;
  closeDeleteConfirm: () => void;

  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Activity;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  duplicateActivity: (id: string) => void;
  toggleActivityComplete: (id: string) => void;

  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  addMilestone: (milestone: Omit<Milestone, 'id'>) => Milestone;
  updateMilestone: (id: string, data: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  toggleMilestone: (id: string) => void;

  addIdea: (idea: Omit<Idea, 'id' | 'createdAt'>) => Idea;
  updateIdea: (id: string, data: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  convertIdeaToProject: (ideaId: string) => void;

  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addAccount: (account: Omit<AccountTracker, 'id' | 'createdAt'>) => AccountTracker;
  updateAccount: (id: string, data: Partial<AccountTracker>) => void;
  deleteAccount: (id: string) => void;

  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  addFile: (file: Omit<FileAttachment, 'uploadedAt'> & { id?: string }) => FileAttachment;
  deleteFile: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;

  updateUser: (user: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  resetToSampleData: () => void;
  exportData: (format: 'csv' | 'json', entity?: 'activities' | 'projects' | 'ideas' | 'notes' | 'clients' | 'all') => void;

  // Team & Member Access Control
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => TeamMember;
  updateTeamMember: (id: string, data: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  loginUser: (email: string, password?: string) => boolean;
  logoutUser: () => void;
  userRole: UserRole;
  isAdmin: boolean;
  isMember: boolean;
  visibleProjects: Project[];
  visibleClients: Client[];
  currentMember?: TeamMember;
  isSelfProject: (project: Project) => boolean;

  // Messages & Communication
  messages: TeamMessage[];
  sendMessage: (data: {
    recipientId: string;
    subject: string;
    content: string;
    relatedProjectId?: string;
    relatedClientId?: string;
  }) => TeamMessage;
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  unreadMessagesCount: number;

  // Approval Workflow
  approveClient: (id: string) => void;
  rejectClient: (id: string, reason?: string) => void;
  approveProject: (id: string) => void;
  rejectProject: (id: string, reason?: string) => void;

  // Feedback Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;

  // Supabase Connection & Live State
  supabaseConnected: boolean;
  isSyncing: boolean;
  syncWithSupabase: () => Promise<void>;
  authLoading: boolean;

  // Public Site CMS Content (Admin Editable)
  publicContent: PublicSiteContent;
  updatePublicContent: (section: 'home' | 'about' | 'contact' | 'developer', data: any) => void;
  resetPublicContent: () => void;
  isPublicEditorOpen: boolean;
  publicEditorActiveTab: 'home' | 'about' | 'contact' | 'developer';
  openPublicEditor: (tab?: 'home' | 'about' | 'contact' | 'developer') => void;
  closePublicEditor: () => void;

  // Project & Personal Timelines & Milestones (Admin & Member)
  toggleMilestoneComplete: (id: string) => void;
  isMilestoneModalOpen: boolean;
  milestoneModalProjectId?: string;
  milestoneModalScope?: 'project' | 'personal';
  openMilestoneModal: (projectId?: string, defaultScope?: 'project' | 'personal') => void;
  closeMilestoneModal: () => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

// Purge legacy mock sample data from localStorage so the app runs purely on live data
const cleanLegacyMockData = () => {
  try {
    const isCleaned = localStorage.getItem('my_journey_mock_purged_v7');
    if (!isCleaned) {
      const keys = [
        'activities',
        'projects',
        'tasks',
        'milestones',
        'ideas',
        'clients',
        'accounts',
        'notes',
        'files',
        'messages',
        'notifications',
        'completedDays',
        'teamMembers',  // Clear old admin seed (Alex Mercer) — replaced with Raghab Barik
        'currentRoute', // Reset route so auth flow redirects correctly
      ];
      keys.forEach((k) => localStorage.removeItem(`my_journey_${k}`));
      localStorage.setItem('my_journey_mock_purged_v7', 'true');
    }
  } catch (e) {
    console.warn('Error clearing legacy mock data:', e);
  }
};
cleanLegacyMockData();


function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`my_journey_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`my_journey_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>(() =>
    loadFromStorage('currentRoute', 'home')
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Supabase Connection & Live State
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true); // true until session is resolved

  // Domain states with localStorage caching & clean live defaults (No mock temp data)
  const [user, setUser] = useState<UserProfile>(() => loadFromStorage('user', INITIAL_USER));
  const [settings, setSettings] = useState<UserSettings>(() => loadFromStorage('settings', INITIAL_SETTINGS));
  const [activities, setActivities] = useState<Activity[]>(() => loadFromStorage('activities', []));
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage('projects', []));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('tasks', []));
  const [milestones, setMilestones] = useState<Milestone[]>(() => loadFromStorage('milestones', []));
  const [ideas, setIdeas] = useState<Idea[]>(() => loadFromStorage('ideas', []));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('clients', []));
  const [accounts, setAccounts] = useState<AccountTracker[]>(() => loadFromStorage('accounts', []));
  const [notes, setNotes] = useState<Note[]>(() => loadFromStorage('notes', []));
  const [files, setFiles] = useState<FileAttachment[]>(() => loadFromStorage('files', []));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadFromStorage('notifications', []));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() =>
    loadFromStorage('teamMembers', [
      {
        id: 'member-admin-1',
        name: 'Raghab Barik',
        email: 'rraghabbarik@gmail.com',
        password: 'Raghab@2062',
        role: 'admin' as const,
        title: 'System Administrator (Owner)',
        assignedClientIds: [],
        assignedProjectIds: [],
        createdAt: '2026-09-01T08:00:00Z',
      },
    ])
  );
  const [messages, setMessages] = useState<TeamMessage[]>(() =>
    loadFromStorage('messages', [])
  );
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(() =>
    loadFromStorage('completedDays', {})
  );

  // Public CMS Content (Editable by Admin)
  const [publicContent, setPublicContent] = useState<PublicSiteContent>(() => {
    const loaded = loadFromStorage('publicContent', DEFAULT_PUBLIC_CONTENT);
    return {
      ...DEFAULT_PUBLIC_CONTENT,
      ...loaded,
      developer: {
        ...DEFAULT_PUBLIC_CONTENT.developer,
        ...(loaded?.developer || {}),
      },
    };
  });
  const [isPublicEditorOpen, setIsPublicEditorOpen] = useState(false);
  const [publicEditorActiveTab, setPublicEditorActiveTab] = useState<'home' | 'about' | 'contact' | 'developer'>('home');

  // Milestone Modal State (Admin & Member)
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneModalProjectId, setMilestoneModalProjectId] = useState<string | undefined>(undefined);
  const [milestoneModalScope, setMilestoneModalScope] = useState<'project' | 'personal'>('project');

  // Sync to localStorage
  useEffect(() => saveToStorage('user', user), [user]);
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('activities', activities), [activities]);
  useEffect(() => saveToStorage('projects', projects), [projects]);
  useEffect(() => saveToStorage('tasks', tasks), [tasks]);
  useEffect(() => saveToStorage('milestones', milestones), [milestones]);
  useEffect(() => saveToStorage('ideas', ideas), [ideas]);
  useEffect(() => saveToStorage('clients', clients), [clients]);
  useEffect(() => saveToStorage('accounts', accounts), [accounts]);
  useEffect(() => saveToStorage('notes', notes), [notes]);
  useEffect(() => saveToStorage('files', files), [files]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('teamMembers', teamMembers), [teamMembers]);
  useEffect(() => saveToStorage('messages', messages), [messages]);
  useEffect(() => saveToStorage('completedDays', completedDays), [completedDays]);
  useEffect(() => saveToStorage('currentRoute', currentRoute), [currentRoute]);
  useEffect(() => saveToStorage('publicContent', publicContent), [publicContent]);

  // Centralized Redis Shared Cache Write-Through Sync
  useEffect(() => {
    if (milestones.length > 0) {
      redisService.cacheMilestones('all', milestones);
    }
  }, [milestones]);

  useEffect(() => {
    if (ideas.length > 0) {
      redisService.cacheIdeas(ideas);
    }
  }, [ideas]);

  useEffect(() => {
    redisService.cachePublicContent(publicContent);
  }, [publicContent]);

  useEffect(() => {
    if (user?.email) {
      redisService.sendMemberHeartbeat(user.email, user.name, user.role || 'admin');
    }
  }, [user]);

  // Supabase Data Fetching & Sync
  const syncWithSupabase = async () => {
    setIsSyncing(true);
    try {
      const isConnected = await supabaseService.ping();
      setSupabaseConnected(isConnected);

      const [
        dbClients,
        dbProjects,
        dbActivities,
        dbTasks,
        dbIdeas,
        dbNotes,
        dbAccounts,
        dbMessages,
        dbMembers,
      ] = await Promise.all([
        supabaseService.fetchClients(),
        supabaseService.fetchProjects(),
        supabaseService.fetchActivities(),
        supabaseService.fetchTasks(),
        supabaseService.fetchIdeas(),
        supabaseService.fetchNotes(),
        supabaseService.fetchAccounts(),
        supabaseService.fetchMessages(),
        supabaseService.fetchTeamMembers(),
      ]);

      if (dbClients && dbClients.length > 0) setClients(dbClients);
      if (dbProjects && dbProjects.length > 0) setProjects(dbProjects);
      if (dbActivities && dbActivities.length > 0) setActivities(dbActivities);
      if (dbTasks && dbTasks.length > 0) setTasks(dbTasks);
      if (dbIdeas && dbIdeas.length > 0) setIdeas(dbIdeas);
      if (dbNotes && dbNotes.length > 0) setNotes(dbNotes);
      if (dbAccounts && dbAccounts.length > 0) setAccounts(dbAccounts);
      if (dbMessages && dbMessages.length > 0) setMessages(dbMessages);
      if (dbMembers && dbMembers.length > 0) setTeamMembers(dbMembers);
    } catch (err) {
      console.warn('Sync with Supabase encountered error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // One-time admin Supabase auth setup
  // Ensures the owner admin account (rraghabbarik@gmail.com) exists in Supabase Auth on first load.
  useEffect(() => {
    const SETUP_KEY = 'my_journey_admin_setup_v1';
    const isDone = localStorage.getItem(SETUP_KEY);
    if (isDone) return;

    const ADMIN_EMAIL = 'rraghabbarik@gmail.com';
    const ADMIN_PASSWORD = 'Raghab@2062';

    supabaseService.createMemberAuth(ADMIN_EMAIL, ADMIN_PASSWORD, 'Raghab Barik', 'admin')
      .then(({ data, error }) => {
        if (!error || (error as any)?.message?.includes('already')) {
          localStorage.setItem(SETUP_KEY, 'done');
        } else {
          console.info('Admin Supabase setup note:', (error as any)?.message);
        }
      })
      .catch(() => {});
  }, []);

  // Initial Supabase Auth Session Check + Sync + Realtime
  useEffect(() => {
    // 1. Check existing session FIRST — this resolves the blank page on reload
    supabaseService.getSession().then(({ data }) => {
      if (data?.session?.user) {
        const u = data.session.user;
        const matchedDbMember = teamMembers.find(
          (m) => m.email.toLowerCase() === (u.email || '').toLowerCase()
        );
        const resolvedRole: UserRole =
          (u.user_metadata?.role as UserRole) ||
          matchedDbMember?.role ||
          (u.email?.toLowerCase() === 'rraghabbarik@gmail.com' ? 'admin' : (u.email?.includes('admin') ? 'admin' : 'member'));

        setUser((prev) => ({
          ...prev,
          email: u.email || prev.email,
          name: u.user_metadata?.name || u.email?.split('@')[0]?.replace(/[._-]/g, ' ') || prev.name,
          role: resolvedRole,
          title: resolvedRole === 'admin' ? 'Administrator' : (matchedDbMember?.title || 'Client Project Specialist'),
          onboarded: true,
        }));

        // Restore last workspace route (not public/auth routes)
        const saved = loadFromStorage<ViewRoute>('currentRoute', 'dashboard');
        const publicRoutes: ViewRoute[] = ['home', 'about', 'contact', 'login', 'register', 'forgot-password', 'onboarding'];
        if (!publicRoutes.includes(saved)) {
          setCurrentRoute(saved);
        } else {
          setCurrentRoute(resolvedRole === 'admin' ? 'dashboard' : 'projects');
        }

        syncWithSupabase();
      } else {
        // No session — redirect to login unless already on a public page
        const saved = loadFromStorage<ViewRoute>('currentRoute', 'home');
        const publicRoutes: ViewRoute[] = ['home', 'about', 'contact', 'login', 'register', 'forgot-password', 'onboarding'];
        if (!publicRoutes.includes(saved)) {
          setCurrentRoute('login');
        }
      }
      // Session check complete — stop showing loading screen
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));

    // 2. Listen for auth state changes (login/logout events)
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const matchedDbMember = teamMembers.find(
          (m) => m.email.toLowerCase() === (u.email || '').toLowerCase()
        );
        const resolvedRole: UserRole =
          (u.user_metadata?.role as UserRole) ||
          matchedDbMember?.role ||
          (u.email?.toLowerCase() === 'rraghabbarik@gmail.com' ? 'admin' : (u.email?.includes('admin') ? 'admin' : 'member'));

        setUser((prev) => ({
          ...prev,
          email: u.email || prev.email,
          name: u.user_metadata?.name || u.email?.split('@')[0]?.replace(/[._-]/g, ' ') || prev.name,
          role: resolvedRole,
          title: resolvedRole === 'admin' ? 'Administrator' : (matchedDbMember?.title || 'Client Project Specialist'),
          onboarded: true,
        }));
        syncWithSupabase();
      } else if (_event === 'SIGNED_OUT') {
        setCurrentRoute('login');
      }
    });

    // 3. Realtime channel for live updates
    const channel = supabase
      .channel('journey_live_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async () => {
        const msgs = await supabaseService.fetchMessages();
        if (msgs) setMessages(msgs);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, async () => {
        const cls = await supabaseService.fetchClients();
        if (cls) setClients(cls);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, async () => {
        const prjs = await supabaseService.fetchProjects();
        if (prjs) setProjects(prjs);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, async () => {
        const acts = await supabaseService.fetchActivities();
        if (acts) setActivities(acts);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
        const ts = await supabaseService.fetchTasks();
        if (ts) setTasks(ts);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, async () => {
        const tm = await supabaseService.fetchTeamMembers();
        if (tm && tm.length > 0) setTeamMembers(tm);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setSupabaseConnected(true);
      });

    return () => {
      authSub.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  // Apply theme class and data-theme to document
  useEffect(() => {
    const isDark =
      user.theme === 'dark' ||
      (user.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [user.theme]);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('my_journey_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('my_journey_sidebar_open', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleSetSidebarOpen = (open: boolean) => {
    setSidebarOpen(open);
    try {
      localStorage.setItem('my_journey_sidebar_open', JSON.stringify(open));
    } catch (e) {}
  };

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState<'activity' | 'project' | 'idea' | 'note' | 'task'>('activity');

  // Modals
  const [activityModal, setActivityModal] = useState<{ isOpen: boolean; initialData?: Partial<Activity>; editId?: string }>({ isOpen: false });
  const [projectModal, setProjectModal] = useState<{ isOpen: boolean; editId?: string; prefillFromIdea?: Idea; prefillClientId?: string }>({ isOpen: false });
  const [ideaModal, setIdeaModal] = useState<{ isOpen: boolean; editId?: string }>({ isOpen: false });
  const [noteModal, setNoteModal] = useState<{ isOpen: boolean; editId?: string }>({ isOpen: false });
  const [clientModal, setClientModal] = useState<{ isOpen: boolean; editId?: string }>({ isOpen: false });
  const [accountModal, setAccountModal] = useState<{ isOpen: boolean; editId?: string }>({ isOpen: false });

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut listener for Ctrl+K and Ctrl+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (route: ViewRoute, id?: string) => {
    if (id) {
      if (route === 'project-detail') setSelectedProjectId(id);
      if (route === 'client-detail') setSelectedClientId(id);
      if (route === 'ideas') setSelectedIdeaId(id);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openQuickAdd = (type: 'activity' | 'project' | 'idea' | 'note' | 'task' = 'activity') => {
    setQuickAddDefaultType(type);
    setQuickAddOpen(true);
  };

  const openActivityModal = (initialData?: Partial<Activity>, editId?: string) => {
    setActivityModal({ isOpen: true, initialData, editId });
  };
  const closeActivityModal = () => setActivityModal({ isOpen: false });

  const openProjectModal = (editId?: string, prefillFromIdea?: Idea, prefillClientId?: string) => {
    setProjectModal({ isOpen: true, editId, prefillFromIdea, prefillClientId });
  };
  const closeProjectModal = () => setProjectModal({ isOpen: false });

  const openIdeaModal = (editId?: string) => setIdeaModal({ isOpen: true, editId });
  const closeIdeaModal = () => setIdeaModal({ isOpen: false });

  const openNoteModal = (editId?: string) => setNoteModal({ isOpen: true, editId });
  const closeNoteModal = () => setNoteModal({ isOpen: false });

  const openClientModal = (editId?: string) => setClientModal({ isOpen: true, editId });
  const closeClientModal = () => setClientModal({ isOpen: false });

  const openAccountModal = (editId?: string) => setAccountModal({ isOpen: true, editId });
  const closeAccountModal = () => setAccountModal({ isOpen: false });

  const requestDelete = (config: Omit<DeleteConfirmConfig, 'isOpen'>) => {
    setDeleteConfirm({ ...config, isOpen: true });
  };
  const closeDeleteConfirm = () => {
    setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
  };

  // Activity Operations
  const addActivity = (data: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const newActivity: Activity = {
      ...data,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);
    supabaseService.saveActivity(newActivity);
    showToast('Activity recorded');
    return newActivity;
  };

  const updateActivity = (id: string, data: Partial<Activity>) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          const updated = { ...act, ...data };
          supabaseService.saveActivity(updated);
          return updated;
        }
        return act;
      })
    );
    showToast('Activity updated');
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((act) => act.id !== id));
    supabaseService.deleteActivity(id);
    showToast('Activity deleted', 'info');
  };

  const duplicateActivity = (id: string) => {
    const target = activities.find((a) => a.id === id);
    if (!target) return;
    const duplicated: Activity = {
      ...target,
      id: `act-${Date.now()}`,
      title: `${target.title} (Copy)`,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [duplicated, ...prev]);
    supabaseService.saveActivity(duplicated);
    showToast('Activity duplicated');
  };

  const toggleActivityComplete = (id: string) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          const nextState = !act.completed;
          const updated = { ...act, completed: nextState };
          supabaseService.saveActivity(updated);
          showToast(
            nextState
              ? `Work item "${act.title}" marked as completed! 🎉`
              : `Work item "${act.title}" marked as in progress.`,
            nextState ? 'success' : 'info'
          );
          return updated;
        }
        return act;
      })
    );
  };

  // Project Operations
  const addProject = (data: Omit<Project, 'id' | 'createdAt'>): Project => {
    const isMemberUser = (user.role || 'admin') === 'member';
    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      approvalStatus: isMemberUser ? 'pending' : (data.approvalStatus || 'approved'),
      createdBy: data.createdBy || user.email,
      createdByName: data.createdByName || user.name,
    };
    setProjects((prev) => [newProject, ...prev]);
    supabaseService.saveProject(newProject);

    if (isMemberUser) {
      setTeamMembers((prev) =>
        prev.map((m) => {
          if (m.email.toLowerCase() === user.email.toLowerCase()) {
            return {
              ...m,
              assignedProjectIds: Array.from(new Set([...(m.assignedProjectIds || []), newProject.id])),
            };
          }
          return m;
        })
      );
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Project Pending Approval',
          message: `Member "${user.name}" submitted project "${newProject.name}" for your approval.`,
          type: 'approval',
          read: false,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      showToast(`Project "${newProject.name}" submitted for Admin approval!`, 'info');
    } else {
      showToast('Project created');
    }
    return newProject;
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === id) {
          const updated = { ...proj, ...data };
          supabaseService.saveProject(updated);
          return updated;
        }
        return proj;
      })
    );
    showToast('Project updated');
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    setMilestones((prev) => prev.filter((m) => m.projectId !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);
    supabaseService.deleteProject(id);
    showToast('Project removed', 'info');
  };

  // Task Operations
  const addTask = (data: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
    supabaseService.saveTask(newTask);
    showToast('Task added');
    return newTask;
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...data };
          supabaseService.saveTask(updated);
          return updated;
        }
        return t;
      })
    );
    showToast('Task updated');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    supabaseService.deleteTask(id);
    showToast('Task deleted', 'info');
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const isNowCompleted = t.status !== 'completed';
        const updated: Task = {
          ...t,
          status: isNowCompleted ? 'completed' : 'todo',
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
        supabaseService.saveTask(updated);
        return updated;
      })
    );
    showToast('Task status updated');
  };

  // Milestone Operations (Both Admin & Member can add/update project & personal milestones)
  const addMilestone = (data: Omit<Milestone, 'id'>): Milestone => {
    const isPersonal = data.scope === 'personal' || !data.projectId || data.projectId === 'personal';
    const newMilestone: Milestone = {
      ...data,
      id: `ms-${Date.now()}`,
      scope: isPersonal ? 'personal' : 'project',
      projectId: isPersonal ? 'personal' : data.projectId,
      createdBy: data.createdBy || user.email,
      createdByName: data.createdByName || user.name,
      createdByRole: data.createdByRole || (user.role || 'admin'),
      category: data.category || (isPersonal ? 'personal' : 'milestone'),
    };
    setMilestones((prev) => [...prev, newMilestone]);
    showToast(
      isPersonal
        ? `Personal milestone "${newMilestone.name}" added to your personal timeline!`
        : `Timeline milestone "${newMilestone.name}" created!`,
      'success'
    );
    return newMilestone;
  };

  const updateMilestone = (id: string, data: Partial<Milestone>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m))
    );
    showToast('Milestone updated');
  };

  const deleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    showToast('Milestone deleted', 'info');
  };

  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const isNowCompleted = m.status !== 'completed';
        const updatedStatus: MilestoneStatus = isNowCompleted ? 'completed' : 'pending';
        return {
          ...m,
          status: updatedStatus,
          completedAt: isNowCompleted ? new Date().toISOString().split('T')[0] : undefined,
        };
      })
    );
    showToast('Milestone status updated');
  };

  const toggleMilestoneComplete = toggleMilestone;

  // Milestone Modal Controls (Admin & Member)
  const openMilestoneModal = (projectId?: string, defaultScope?: 'project' | 'personal') => {
    setMilestoneModalProjectId(projectId);
    setMilestoneModalScope(defaultScope || (projectId ? 'project' : 'project'));
    setIsMilestoneModalOpen(true);
  };

  const closeMilestoneModal = () => {
    setIsMilestoneModalOpen(false);
    setMilestoneModalProjectId(undefined);
    setMilestoneModalScope('project');
  };

  // Public CMS Site Editor Controls (Admin only)
  const updatePublicContent = (section: 'home' | 'about' | 'contact' | 'developer', data: any) => {
    if (!isAdmin) {
      showToast('Unauthorized: Only administrators can edit public website content.', 'warning');
      return;
    }
    setPublicContent((prev) => {
      const next = {
        ...prev,
        [section]: {
          ...prev[section],
          ...data,
        },
      };
      showToast(`✨ Public ${section} details updated & published live!`, 'success');
      return next;
    });
  };

  const resetPublicContent = () => {
    if (!isAdmin) {
      showToast('Unauthorized: Only administrators can reset public content.', 'warning');
      return;
    }
    setPublicContent(DEFAULT_PUBLIC_CONTENT);
    showToast('Reset public site content to defaults.', 'info');
  };

  const openPublicEditor = (tab?: 'home' | 'about' | 'contact' | 'developer') => {
    if (!isAdmin) {
      showToast('Only administrators have access to edit the public website.', 'warning');
      return;
    }
    if (tab) setPublicEditorActiveTab(tab);
    setIsPublicEditorOpen(true);
  };

  const closePublicEditor = () => {
    setIsPublicEditorOpen(false);
  };

  // Idea Operations
  const addIdea = (data: Omit<Idea, 'id' | 'createdAt'>): Idea => {
    const newIdea: Idea = {
      ...data,
      id: `idea-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || user.email,
      createdByName: data.createdByName || user.name,
      createdByRole: data.createdByRole || (user.role || 'admin'),
    };
    setIdeas((prev) => [newIdea, ...prev]);
    supabaseService.saveIdea(newIdea);
    showToast('✨ Idea captured in vault! Click to view details.', 'success');
    return newIdea;
  };

  const updateIdea = (id: string, data: Partial<Idea>) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === id) {
          const updated = { ...idea, ...data };
          supabaseService.saveIdea(updated);
          return updated;
        }
        return idea;
      })
    );
    showToast('Idea updated');
  };

  const deleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    supabaseService.deleteIdea(id);
    showToast('Idea removed', 'info');
  };

  const convertIdeaToProject = (ideaId: string) => {
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) return;
    openProjectModal(undefined, idea);
  };

  // Client Operations
  const addClient = (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const isMemberUser = (user.role || 'admin') === 'member';
    const newClient: Client = {
      ...data,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
      approvalStatus: isMemberUser ? 'pending' : (data.approvalStatus || 'approved'),
      createdBy: data.createdBy || user.email,
      createdByName: data.createdByName || user.name,
    };
    setClients((prev) => [newClient, ...prev]);
    supabaseService.saveClient(newClient);

    if (isMemberUser) {
      setTeamMembers((prev) =>
        prev.map((m) => {
          if (m.email.toLowerCase() === user.email.toLowerCase()) {
            return {
              ...m,
              assignedClientIds: Array.from(new Set([...(m.assignedClientIds || []), newClient.id])),
            };
          }
          return m;
        })
      );
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Client Pending Approval',
          message: `Member "${user.name}" submitted client "${newClient.company}" for your approval.`,
          type: 'approval',
          read: false,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      showToast(`Client "${newClient.company}" submitted for Admin approval!`, 'info');
    } else {
      showToast('Client added');
    }
    return newClient;
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...data };
          supabaseService.saveClient(updated);
          return updated;
        }
        return c;
      })
    );
    showToast('Client updated');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (selectedClientId === id) setSelectedClientId(null);
    supabaseService.deleteClient(id);
    showToast('Client deleted', 'info');
  };

  // Account Operations
  const addAccount = (data: Omit<AccountTracker, 'id' | 'createdAt'>): AccountTracker => {
    const newAccount: AccountTracker = {
      ...data,
      id: `acc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) => [newAccount, ...prev]);
    supabaseService.saveAccount(newAccount);
    showToast('Account record created');
    return newAccount;
  };

  const updateAccount = (id: string, data: Partial<AccountTracker>) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const updated = { ...acc, ...data };
          supabaseService.saveAccount(updated);
          return updated;
        }
        return acc;
      })
    );
    showToast('Account record updated');
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    supabaseService.deleteAccount(id);
    showToast('Account record deleted', 'info');
  };

  // Note Operations
  const addNote = (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...data,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    supabaseService.saveNote(newNote);
    showToast('Note created');
    return newNote;
  };

  const updateNote = (id: string, data: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, ...data, updatedAt: new Date().toISOString() };
          supabaseService.saveNote(updated);
          return updated;
        }
        return n;
      })
    );
    showToast('Note updated');
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    supabaseService.deleteNote(id);
    showToast('Note deleted', 'info');
  };

  // File Operations
  const addFile = (data: Omit<FileAttachment, 'uploadedAt'> & { id?: string }): FileAttachment => {
    const newFile: FileAttachment = {
      ...data,
      // Use caller-supplied id (so it matches the IndexedDB blob key) or generate a fallback
      id: data.id || `file-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setFiles((prev) => [newFile, ...prev]);
    showToast('File attached');
    return newFile;
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    deleteFileBlob(id);
    showToast('File deleted', 'info');
  };

  // Notification Operations
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // User & Settings
  const updateUser = (patch: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...patch }));
    showToast('Profile updated');
  };

  const updateSettings = (patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    showToast('Settings saved');
  };

  const toggleTheme = () => {
    const nextTheme = user.theme === 'dark' ? 'light' : 'dark';
    setUser((prev) => ({ ...prev, theme: nextTheme }));
    setSettings((prev) => ({ ...prev, theme: nextTheme }));
    showToast(`Switched to ${nextTheme} mode`);
  };

  const resetToSampleData = () => {
    syncWithSupabase();
    showToast('Refreshed data from Supabase Live Database', 'info');
  };

  // Team & Member Access Control
  const userRole: UserRole = user.role || 'admin';
  const isAdmin = userRole === 'admin';
  const isMember = userRole === 'member';

  const currentMember = teamMembers.find(
    (m) => user.email && m.email.toLowerCase() === user.email.toLowerCase()
  ) || (isMember && user.email ? {
    id: `member-${user.email}`,
    name: user.name || user.email.split('@')[0],
    email: user.email,
    role: 'member' as const,
    title: user.title || 'Client Project Specialist',
    assignedClientIds: [],
    assignedProjectIds: [],
    createdAt: new Date().toISOString(),
  } : undefined);

  const isSelfProject = (p: Project) => {
    return !p.clientId || p.clientId === 'self';
  };

  const visibleClients = clients.filter((c) => {
    if (!isMember) return true; // Admins see all clients

    // 1. Member can ALWAYS see clients they created / submitted (even if pending approval)
    if (
      c.createdBy &&
      (c.createdBy.toLowerCase() === user.email.toLowerCase() ||
        (currentMember && c.createdBy.toLowerCase() === currentMember.email.toLowerCase()))
    ) {
      return true;
    }

    // 2. Check directly assigned clients
    if (currentMember?.assignedClientIds && currentMember.assignedClientIds.includes(c.id)) {
      return true;
    }

    // 3. Check clients of assigned projects
    if (currentMember?.assignedProjectIds && currentMember.assignedProjectIds.length > 0) {
      const hasAssignedProjectForClient = projects.some(
        (p) => currentMember.assignedProjectIds!.includes(p.id) && p.clientId === c.id
      );
      if (hasAssignedProjectForClient) return true;
    }

    // 4. If the member has NO explicit restricted client assignments configured
    // (i.e. general workspace access), they see all approved/active clients added in the workspace
    const hasRestrictedClientList = Boolean(
      currentMember?.assignedClientIds && currentMember.assignedClientIds.length > 0
    );
    if (!hasRestrictedClientList) {
      return c.approvalStatus === 'approved' || !c.approvalStatus;
    }

    return false;
  });

  const visibleProjects = projects.filter((p) => {
    if (!isMember) return true; // Admins see all projects

    // 1. Member can ALWAYS see projects they created / submitted (even if pending or without client)
    if (
      p.createdBy &&
      (p.createdBy.toLowerCase() === user.email.toLowerCase() ||
        (currentMember && p.createdBy.toLowerCase() === currentMember.email.toLowerCase()))
    ) {
      return true;
    }

    // 2. Check directly assigned projects
    if (currentMember?.assignedProjectIds && currentMember.assignedProjectIds.includes(p.id)) {
      return true;
    }

    // 3. Check projects associated with assigned clients
    if (
      currentMember?.assignedClientIds &&
      p.clientId &&
      currentMember.assignedClientIds.includes(p.clientId)
    ) {
      return true;
    }

    // 4. If the member has NO explicit restricted project assignments configured:
    const hasRestrictedProjects = Boolean(
      currentMember?.assignedProjectIds && currentMember.assignedProjectIds.length > 0
    );
    const hasRestrictedClients = Boolean(
      currentMember?.assignedClientIds && currentMember.assignedClientIds.length > 0
    );

    if (!hasRestrictedProjects && !hasRestrictedClients) {
      // General workspace access: member sees all approved projects
      return p.approvalStatus === 'approved' || !p.approvalStatus;
    }

    // 5. If this project belongs to any client currently visible to the member:
    if (p.clientId && p.clientId !== 'self') {
      const isClientVisible = visibleClients.some((c) => c.id === p.clientId);
      if (isClientVisible && (p.approvalStatus === 'approved' || !p.approvalStatus)) {
        return true;
      }
    }

    return false;
  });

  // Guard member routes: members can only see 'projects', 'project-detail', 'clients', 'client-detail', 'messages', 'timeline'
  useEffect(() => {
    if (isMember) {
      const allowedRoutes: ViewRoute[] = [
        'projects',
        'project-detail',
        'clients',
        'client-detail',
        'messages',
        'timeline',
        'personal-timeline',
      ];
      if (!allowedRoutes.includes(currentRoute)) {
        setCurrentRoute('projects');
      }
    }
  }, [isMember, currentRoute]);

  const addTeamMember = (data: Omit<TeamMember, 'id' | 'createdAt'>): TeamMember => {
    const newMember: TeamMember = {
      ...data,
      id: `member-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTeamMembers((prev) => [...prev, newMember]);
    supabaseService.saveTeamMember(newMember);
    showToast(`Team member "${newMember.name}" created!`);
    return newMember;
  };

  const updateTeamMember = (id: string, data: Partial<TeamMember>) => {
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...data };
          supabaseService.saveTeamMember(updated);
          return updated;
        }
        return m;
      })
    );
    showToast('Member details updated');
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    supabaseService.deleteTeamMember(id);
    showToast('Member removed', 'info');
  };

  // Messaging Operations
  const sendMessage = (data: {
    recipientId: string;
    subject: string;
    content: string;
    relatedProjectId?: string;
    relatedClientId?: string;
  }): TeamMessage => {
    const targetMember = teamMembers.find(
      (m) => m.id === data.recipientId || m.email.toLowerCase() === data.recipientId.toLowerCase()
    );

    const recipientName =
      data.recipientId === 'all'
        ? 'All Team Members'
        : targetMember
        ? targetMember.name
        : data.recipientId;

    const recipientEmail =
      data.recipientId === 'all'
        ? 'all@journey.internal'
        : targetMember
        ? targetMember.email
        : data.recipientId;

    const newMsg: TeamMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.email,
      senderName: `${user.name}${isAdmin ? ' (Admin)' : ' (Member)'}`,
      senderEmail: user.email,
      senderRole: userRole,
      recipientId: data.recipientId,
      recipientName,
      recipientEmail,
      subject: data.subject.trim(),
      content: data.content.trim(),
      createdAt: new Date().toISOString(),
      read: false,
      relatedProjectId: data.relatedProjectId,
      relatedClientId: data.relatedClientId,
    };

    setMessages((prev) => [newMsg, ...prev]);
    supabaseService.saveMessage(newMsg);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Message from ${user.name}: ${data.subject.slice(0, 30)}`,
        message: data.content.slice(0, 80) + (data.content.length > 80 ? '...' : ''),
        type: 'message',
        read: false,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    showToast(`Message sent to ${recipientName}!`, 'success');
    return newMsg;
  };

  const markMessageRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, read: true };
          supabaseService.saveMessage(updated);
          return updated;
        }
        return m;
      })
    );
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    supabaseService.deleteMessage(id);
    showToast('Message deleted', 'info');
  };

  const unreadMessagesCount = messages.filter((m) => {
    if (m.read) return false;
    if (isMember) {
      return (
        m.recipientId === 'all' ||
        m.recipientId.toLowerCase() === user.email.toLowerCase() ||
        m.recipientEmail?.toLowerCase() === user.email.toLowerCase() ||
        (currentMember && m.recipientId === currentMember.id)
      );
    }
    return (
      m.recipientId.toLowerCase() === user.email.toLowerCase() ||
      m.recipientId === 'admin'
    );
  }).length;

  // Approval Workflow
  const approveClient = (id: string) => {
    const target = clients.find((c) => c.id === id);
    if (!target) return;

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, approvalStatus: 'approved' as const, rejectionReason: undefined };
          supabaseService.saveClient(updated);
          return updated;
        }
        return c;
      })
    );

    if (target.createdBy) {
      setTeamMembers((prev) =>
        prev.map((m) => {
          if (m.email.toLowerCase() === target.createdBy?.toLowerCase()) {
            const updated = {
              ...m,
              assignedClientIds: Array.from(new Set([...(m.assignedClientIds || []), id])),
            };
            supabaseService.saveTeamMember(updated);
            return updated;
          }
          return m;
        })
      );

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Client Approved!',
          message: `Your client submission "${target.company}" was approved by Admin!`,
          type: 'approval',
          read: false,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);

      const approvalNotice: TeamMessage = {
        id: `msg-${Date.now()}`,
        senderId: user.email,
        senderName: `${user.name} (Admin)`,
        senderEmail: user.email,
        senderRole: 'admin',
        recipientId: target.createdBy,
        recipientEmail: target.createdBy,
        recipientName: target.createdByName || 'Team Member',
        subject: `Approved: Client "${target.company}" is now active`,
        content: `Your client "${target.company}" (${target.name}) has been approved and activated in the workspace. You can now execute projects, track tasks, and log deliverables.`,
        createdAt: new Date().toISOString(),
        read: false,
        relatedClientId: id,
      };
      setMessages((prev) => [approvalNotice, ...prev]);
      supabaseService.saveMessage(approvalNotice);
    }

    showToast(`Client "${target.company}" approved! 🎉`, 'success');
  };

  const rejectClient = (id: string, reason?: string) => {
    const target = clients.find((c) => c.id === id);
    if (!target) return;

    const note = reason?.trim() || 'Submission rejected by Admin';
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, approvalStatus: 'rejected' as const, rejectionReason: note };
          supabaseService.saveClient(updated);
          return updated;
        }
        return c;
      })
    );

    if (target.createdBy) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Client Submission Not Approved',
          message: `Your client "${target.company}" was not approved. ${reason ? `Reason: ${reason}` : ''}`,
          type: 'approval',
          read: false,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    showToast(`Client "${target.company}" rejected.`, 'info');
  };

  const approveProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, approvalStatus: 'approved' as const, rejectionReason: undefined };
          supabaseService.saveProject(updated);
          return updated;
        }
        return p;
      })
    );

    if (target.createdBy) {
      setTeamMembers((prev) =>
        prev.map((m) => {
          if (m.email.toLowerCase() === target.createdBy?.toLowerCase()) {
            const updated = {
              ...m,
              assignedProjectIds: Array.from(new Set([...(m.assignedProjectIds || []), id])),
            };
            supabaseService.saveTeamMember(updated);
            return updated;
          }
          return m;
        })
      );

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Project Approved!',
          message: `Your project "${target.name}" was approved by Admin!`,
          type: 'approval',
          read: false,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);

      const approvalNotice: TeamMessage = {
        id: `msg-${Date.now()}`,
        senderId: user.email,
        senderName: `${user.name} (Admin)`,
        senderEmail: user.email,
        senderRole: 'admin',
        recipientId: target.createdBy,
        recipientEmail: target.createdBy,
        recipientName: target.createdByName || 'Team Member',
        subject: `Approved: Project "${target.name}" is now active`,
        content: `Your project "${target.name}" has been approved. You are ready to log activities, track tasks, and execute deliverables!`,
        createdAt: new Date().toISOString(),
        read: false,
        relatedProjectId: id,
        relatedClientId: target.clientId,
      };
      setMessages((prev) => [approvalNotice, ...prev]);
      supabaseService.saveMessage(approvalNotice);
    }

    showToast(`Project "${target.name}" approved! 🎉`, 'success');
  };

  const rejectProject = (id: string, reason?: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;

    const note = reason?.trim() || 'Submission rejected by Admin';
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, approvalStatus: 'rejected' as const, rejectionReason: note };
          supabaseService.saveProject(updated);
          return updated;
        }
        return p;
      })
    );

    if (target.createdBy) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Project Submission Not Approved',
          message: `Your project "${target.name}" was not approved. ${reason ? `Reason: ${reason}` : ''}`,
          type: 'approval',
          read: false,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    showToast(`Project "${target.name}" rejected.`, 'info');
  };

  // loginUser: Pure Supabase Auth — validates credentials against Supabase only.
  // Returns false synchronously (for UI); actual navigation happens after Supabase responds.
  const loginUser = (email: string, password?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();

    if (!password) {
      showToast('Password is required.', 'warning');
      return false;
    }

    // Try Supabase first
    supabaseService.signIn(cleanEmail, password)
      .then(({ data: authData, error: authError }) => {
        if (authData?.user && !authError) {
          const authUser = authData.user;
          const resolvedRole: UserRole =
            (authUser.user_metadata?.role as UserRole) ||
            (cleanEmail.includes('admin') ? 'admin' : 'member');

          setUser({
            name: authUser.user_metadata?.name || cleanEmail.split('@')[0].replace(/[._-]/g, ' '),
            email: authUser.email || cleanEmail,
            role: resolvedRole,
            title: resolvedRole === 'admin' ? 'Administrator' : 'Client Project Specialist',
            avatarUrl: '',
            trackingInterests: INITIAL_USER.trackingInterests,
            onboarded: true,
            theme: user.theme || 'dark',
          });
          showToast(
            resolvedRole === 'admin'
              ? `Welcome Admin! Signed in as ${authUser.user_metadata?.name || cleanEmail}`
              : `Signed in as Member. Access to your allocated clients & projects.`
          );
          syncWithSupabase();
          if (resolvedRole === 'member') {
            navigateTo('projects');
          } else {
            navigateTo('dashboard');
          }
        } else {
          // Supabase login failed — try local team member password as fallback.
          // This also handles "Email not confirmed" errors so members can still sign in.
          const matchedMember = teamMembers.find(
            (m) => m.email.toLowerCase() === cleanEmail
          );
          if (matchedMember && matchedMember.password === password) {
            setUser({
              name: matchedMember.name,
              email: matchedMember.email,
              role: matchedMember.role,
              title: matchedMember.title,
              avatarUrl: '',
              trackingInterests: INITIAL_USER.trackingInterests,
              onboarded: true,
              theme: user.theme || 'dark',
            });
            showToast(
              matchedMember.role === 'admin'
                ? `Welcome Admin: ${matchedMember.name}`
                : `Signed in as Member: ${matchedMember.name}`
            );
            syncWithSupabase();
            if (matchedMember.role === 'member') {
              navigateTo('projects');
            } else {
              navigateTo('dashboard');
            }
          } else {
            // Show a user-friendly message instead of raw Supabase errors
            const rawMsg: string = (authError as any)?.message || '';
            const errMsg = rawMsg.toLowerCase().includes('email not confirmed')
              ? 'Sign in failed. Please ask your admin to verify your account.'
              : rawMsg || 'Invalid email or password';
            showToast(errMsg, 'warning');
          }
        }
      })
      .catch((e) => {
        console.warn('Supabase signIn error:', e);
        showToast('Sign in failed. Please check your connection.', 'warning');
      });

    return true; // Return synchronously; state updates happen async above
  };

  const logoutUser = () => {
    supabaseService.signOut().catch(() => {});
    setUser({
      ...INITIAL_USER,
      email: '',
      name: 'Guest',
      role: 'admin',
    });
    showToast('Signed out successfully');
    navigateTo('home');
  };

  const exportData = (
    format: 'csv' | 'json',
    entity: 'activities' | 'projects' | 'ideas' | 'notes' | 'clients' | 'all' = 'all'
  ) => {
    let content = '';
    let filename = `my-journey-${entity}-${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      const exportObject: Record<string, any> = {};
      if (entity === 'all' || entity === 'activities') exportObject.activities = activities;
      if (entity === 'all' || entity === 'projects') {
        exportObject.projects = projects;
        exportObject.tasks = tasks;
        exportObject.milestones = milestones;
      }
      if (entity === 'all' || entity === 'ideas') exportObject.ideas = ideas;
      if (entity === 'all' || entity === 'notes') exportObject.notes = notes;
      if (entity === 'all' || entity === 'clients') exportObject.clients = clients;
      content = JSON.stringify(exportObject, null, 2);
      filename += '.json';
    } else {
      // CSV export
      filename += '.csv';
      if (entity === 'activities' || entity === 'all') {
        const headers = ['Date', 'Title', 'Type', 'Duration (mins)', 'Project', 'Tags', 'Notes'];
        const rows = activities.map((a) => [
          `"${a.date}"`,
          `"${a.title.replace(/"/g, '""')}"`,
          `"${a.type}"`,
          a.durationMinutes,
          `"${projects.find((p) => p.id === a.projectId)?.name || ''}"`,
          `"${a.tags.join(', ')}"`,
          `"${(a.notes || '').replace(/"/g, '""')}"`,
        ]);
        content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      } else if (entity === 'projects') {
        const headers = ['Name', 'Category', 'Status', 'Priority', 'Progress (%)', 'Deadline', 'Tags'];
        const rows = projects.map((p) => [
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.category}"`,
          `"${p.status}"`,
          `"${p.priority}"`,
          p.progress,
          `"${p.deadline || ''}"`,
          `"${p.tags.join(', ')}"`,
        ]);
        content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      } else {
        content = JSON.stringify(activities, null, 2);
      }
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${entity} as ${format.toUpperCase()}`);
  };

  const toggleDayComplete = (dateStr?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const d = dateStr || today;
    setCompletedDays((prev) => {
      const current = prev[d] ?? false;
      const next = !current;
      showToast(
        next
          ? `🎉 Daily Journey for ${d} marked as Complete!`
          : `Daily Journey for ${d} marked as In Progress.`,
        next ? 'success' : 'info'
      );
      return { ...prev, [d]: next };
    });
  };

  const isDayCompleted = (dateStr?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const d = dateStr || today;
    if (completedDays[d] !== undefined) return completedDays[d];
    // Automatically consider completed only if day's focus time is >= 3.5 hours (210 mins) and has actual activities
    const dayActs = activities.filter((a) => a.date === d);
    if (dayActs.length === 0) return false;
    const dayMins = dayActs.reduce((acc, a) => acc + a.durationMinutes, 0);
    return dayMins >= 210;
  };

  const addProjectPlanFile = (
    projectId: string,
    file: { name: string; type: string; size?: string; url?: string; fileData?: string }
  ) => {
    const newFile: PlanFile = {
      id: 'pf-' + Date.now(),
      name: file.name,
      type: file.type || 'Document',
      size: file.size || '1.0 MB',
      url: file.url || file.fileData || '#',
      fileData: file.fileData,
      addedAt: new Date().toISOString().slice(0, 10),
    };
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            planFiles: [...(p.planFiles || []), newFile],
          };
        }
        return p;
      })
    );
    showToast(`Plan file "${file.name}" added to project!`, 'success');
  };

  const removeProjectPlanFile = (projectId: string, fileId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            planFiles: (p.planFiles || []).filter((f) => f.id !== fileId),
          };
        }
        return p;
      })
    );
    showToast('Plan file removed', 'info');
  };

  return (
    <JourneyContext.Provider
      value={{
        currentRoute,
        selectedProjectId,
        selectedClientId,
        selectedIdeaId,
        searchQuery,
        setSearchQuery,
        navigateTo,

        user,
        settings,
        activities,
        projects,
        tasks,
        milestones,
        ideas,
        clients,
        accounts,
        notes,
        files,
        notifications,

        commandPaletteOpen,
        setCommandPaletteOpen,
        quickAddOpen,
        setQuickAddOpen,
        quickAddDefaultType,
        openQuickAdd,

        completedDays,
        toggleDayComplete,
        isDayCompleted,

        addProjectPlanFile,
        removeProjectPlanFile,

        activityModal,
        openActivityModal,
        closeActivityModal,

        projectModal,
        openProjectModal,
        closeProjectModal,

        ideaModal,
        openIdeaModal,
        closeIdeaModal,

        noteModal,
        openNoteModal,
        closeNoteModal,

        clientModal,
        openClientModal,
        closeClientModal,

        accountModal,
        openAccountModal,
        closeAccountModal,

        deleteConfirm,
        requestDelete,
        closeDeleteConfirm,

        addActivity,
        updateActivity,
        deleteActivity,
        duplicateActivity,
        toggleActivityComplete,

        addProject,
        updateProject,
        deleteProject,

        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,

        addMilestone,
        updateMilestone,
        deleteMilestone,
        toggleMilestone,

        addIdea,
        updateIdea,
        deleteIdea,
        convertIdeaToProject,

        addClient,
        updateClient,
        deleteClient,

        addAccount,
        updateAccount,
        deleteAccount,

        addNote,
        updateNote,
        deleteNote,

        addFile,
        deleteFile,

        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,

        updateUser,
        updateSettings,
        toggleTheme,
        resetToSampleData,
        exportData,

        teamMembers,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        loginUser,
        logoutUser,
        userRole,
        isAdmin,
        isMember,
        visibleProjects,
        visibleClients,
        currentMember,
        isSelfProject,

        messages,
        sendMessage,
        markMessageRead,
        deleteMessage,
        unreadMessagesCount,
        approveClient,
        rejectClient,
        approveProject,
        rejectProject,

        toasts,
        showToast,
        dismissToast,

        sidebarOpen,
        setSidebarOpen: handleSetSidebarOpen,
        toggleSidebar,
        supabaseConnected,
        isSyncing,
        syncWithSupabase,
        authLoading,

        // Public Site CMS Content
        publicContent,
        updatePublicContent,
        resetPublicContent,
        isPublicEditorOpen,
        publicEditorActiveTab,
        openPublicEditor,
        closePublicEditor,

        // Project & Personal Timelines & Milestones
        toggleMilestoneComplete,
        isMilestoneModalOpen,
        milestoneModalProjectId,
        milestoneModalScope,
        openMilestoneModal,
        closeMilestoneModal,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};

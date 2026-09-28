export type ActivityType =
  | 'reading'
  | 'learning'
  | 'work'
  | 'building'
  | 'exercise'
  | 'goal'
  | 'meeting'
  | 'achievement'
  | 'personal'
  | 'custom';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  durationMinutes: number;
  type: ActivityType;
  projectId?: string;
  clientId?: string;
  tags: string[];
  notes?: string;
  attachments?: FileAttachment[];
  completed?: boolean;
  createdAt: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'archived';
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface PlanFile {
  id: string;
  name: string;
  type: string;
  size?: string;
  url?: string;
  fileData?: string;
  addedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  startDate: string;
  deadline?: string;
  progress: number; // 0 - 100
  clientId?: string;
  relatedAccountId?: string;
  tags: string[];
  createdAt: string;

  // Technical specifications & resource links
  githubUrl?: string;
  databaseUrl?: string;
  databaseType?: string;
  databaseNotes?: string;
  liveUrl?: string;
  publishUrl?: string;
  figmaUrl?: string;
  planDetails?: string;
  planFiles?: PlanFile[];

  // Approval workflow
  createdBy?: string;
  createdByName?: string;
  approvalStatus?: ApprovalStatus;
  rejectionReason?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: PriorityLevel;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';
export type MilestoneScope = 'project' | 'personal';
export type MilestoneCategory =
  | 'kickoff'
  | 'design'
  | 'development'
  | 'review'
  | 'delivery'
  | 'milestone'
  | 'deadline'
  | 'personal'
  | 'learning'
  | 'fitness'
  | 'career'
  | 'finance'
  | 'habit'
  | 'health'
  | 'travel';

export interface Milestone {
  id: string;
  projectId?: string;
  scope?: MilestoneScope;
  name: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  status: MilestoneStatus;
  order: number;
  completedAt?: string;
  category?: MilestoneCategory;
  createdBy?: string;
  createdByName?: string;
  createdByRole?: UserRole;
}

export type IdeaStatus = 'idea' | 'planning' | 'building' | 'project' | 'completed';

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: PriorityLevel;
  status: IdeaStatus;
  tags: string[];
  notes?: string;
  relatedProjectId?: string;
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
  createdByRole?: 'admin' | 'member';
}

export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;

  // Approval workflow
  createdBy?: string;
  createdByName?: string;
  approvalStatus?: ApprovalStatus;
  rejectionReason?: string;
}

export interface AccountTracker {
  id: string;
  service: string;
  email: string;
  purpose: string;
  linkedProjectIds?: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  linkedProjectId?: string;
  linkedIdeaId?: string;
  linkedClientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: string; // e.g. "1.2 MB"
  url?: string;
  linkedProjectId?: string;
  linkedActivityId?: string;
  uploadedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'task' | 'summary' | 'reminder' | 'approval' | 'message';
  read: boolean;
  timestamp: string;
}

export type UserRole = 'admin' | 'member';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  title?: string;
  assignedClientIds?: string[];
  assignedProjectIds?: string[];
  createdAt: string;
}

export interface TeamMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: UserRole;
  recipientId: string; // member email / ID or 'all'
  recipientName?: string;
  recipientEmail?: string;
  subject: string;
  content: string;
  createdAt: string;
  read: boolean;
  relatedProjectId?: string;
  relatedClientId?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role?: UserRole;
  title?: string;
  avatarUrl?: string;
  trackingInterests: string[];
  onboarded: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UserSettings {
  dailyReminder: boolean;
  deadlineReminder: boolean;
  taskReminder: boolean;
  weeklySummary: boolean;
  theme: 'light' | 'dark' | 'system';
}

export type ViewRoute =
  | 'home'
  | 'about'
  | 'contact'
  | 'dashboard'
  | 'daily'
  | 'projects'
  | 'project-detail'
  | 'ideas'
  | 'growth'
  | 'timeline'
  | 'personal-timeline'
  | 'clients'
  | 'client-detail'
  | 'messages'
  | 'accounts'
  | 'notes'
  | 'files'
  | 'search'
  | 'ai-assistant'
  | 'settings'
  | 'export'
  | 'team-members'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'onboarding';

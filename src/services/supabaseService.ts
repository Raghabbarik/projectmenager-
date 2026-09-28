import { supabase } from '../lib/supabase';
import {
  Activity,
  Project,
  Task,
  Client,
  Idea,
  AccountTracker,
  Note,
  TeamMessage,
  TeamMember,
} from '../types';

// ==========================================================
// Safe Data Extractors (Handles both flat columns and raw_data)
// ==========================================================
const mapClientFromDb = (row: any): Client => {
  const raw = row.raw_data || {};
  return {
    id: row.id,
    name: row.name || raw.name || '',
    company: row.company || raw.company || '',
    email: row.email || raw.email || '',
    phone: row.phone || raw.phone || '',
    notes: row.notes || raw.notes,
    approvalStatus: row.approval_status || raw.approvalStatus || 'approved',
    rejectionReason: row.rejection_reason || raw.rejectionReason,
    createdBy: row.created_by || raw.createdBy,
    createdByName: row.created_by_name || raw.createdByName,
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
  };
};

const mapProjectFromDb = (row: any): Project => {
  const raw = row.raw_data || {};
  return {
    id: row.id,
    name: row.name || raw.name || '',
    description: row.description || raw.description || '',
    category: row.category || raw.category || 'client',
    status: row.status || raw.status || 'in_progress',
    priority: row.priority || raw.priority || 'medium',
    progress: Number(row.progress || raw.progress || 0),
    startDate: row.start_date || raw.startDate || new Date().toISOString().split('T')[0],
    deadline: row.deadline || raw.deadline,
    clientId: row.client_id || raw.clientId,
    relatedAccountId: row.related_account_id || raw.relatedAccountId,
    tags: Array.isArray(row.tags) ? row.tags : raw.tags || [],
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
    githubUrl: row.github_url || raw.githubUrl,
    databaseUrl: row.database_url || raw.databaseUrl,
    databaseType: row.database_type || raw.databaseType,
    databaseNotes: row.database_notes || raw.databaseNotes,
    liveUrl: row.live_url || raw.liveUrl,
    publishUrl: row.publish_url || raw.publishUrl,
    figmaUrl: row.figma_url || raw.figmaUrl,
    planDetails: row.plan_details || raw.planDetails,
    planFiles: Array.isArray(row.plan_files) ? row.plan_files : raw.planFiles || [],
    approvalStatus: row.approval_status || raw.approvalStatus || 'approved',
    rejectionReason: row.rejection_reason || raw.rejectionReason,
    createdBy: row.created_by || raw.createdBy,
    createdByName: row.created_by_name || raw.createdByName,
  };
};

const mapActivityFromDb = (row: any): Activity => {
  const raw = row.raw_data || {};
  return {
    id: row.id,
    title: row.title || raw.title || '',
    description: row.description || raw.description,
    date: row.date || raw.date || new Date().toISOString().split('T')[0],
    startTime: row.start_time || raw.startTime,
    endTime: row.end_time || raw.endTime,
    durationMinutes: Number(row.duration_minutes || raw.durationMinutes || 30),
    type: row.type || raw.type || 'work',
    projectId: row.project_id || raw.projectId,
    clientId: row.client_id || raw.clientId,
    tags: Array.isArray(row.tags) ? row.tags : raw.tags || [],
    notes: row.notes || raw.notes,
    completed: row.completed ?? raw.completed ?? false,
    attachments: Array.isArray(row.attachments) ? row.attachments : raw.attachments || [],
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
  };
};

const mapTaskFromDb = (row: any): Task => {
  const raw = row.raw_data || {};
  return {
    id: row.id,
    projectId: row.project_id || raw.projectId || '',
    title: row.title || raw.title || '',
    description: row.description || raw.description,
    status: row.status || raw.status || 'todo',
    priority: row.priority || raw.priority || 'medium',
    dueDate: row.due_date || raw.dueDate,
    completedAt: row.completed_at || raw.completedAt,
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
  };
};

const mapMessageFromDb = (row: any): TeamMessage => {
  const raw = row.raw_data || {};
  return {
    id: row.id,
    senderId: row.sender_id || raw.senderId || '',
    senderName: row.sender_name || raw.senderName || '',
    senderEmail: row.sender_email || raw.senderEmail || '',
    senderRole: row.sender_role || raw.senderRole || 'member',
    recipientId: row.recipient_id || raw.recipientId || '',
    recipientName: row.recipient_name || raw.recipientName || '',
    recipientEmail: row.recipient_email || raw.recipientEmail || '',
    subject: row.subject || raw.subject || '',
    content: row.content || raw.content || '',
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
    read: row.read ?? raw.read ?? false,
    relatedProjectId: row.related_project_id || raw.relatedProjectId,
    relatedClientId: row.related_client_id || raw.relatedClientId,
  };
};

const mapMemberFromDb = (row: any): TeamMember => {
  const raw = row.raw_data || {};
  return {
    id: row.id,
    name: row.name || raw.name || '',
    email: row.email || raw.email || '',
    role: row.role || raw.role || 'member',
    title: row.title || raw.title || '',
    assignedClientIds: Array.isArray(row.assigned_client_ids)
      ? row.assigned_client_ids
      : raw.assignedClientIds || [],
    assignedProjectIds: Array.isArray(row.assigned_project_ids)
      ? row.assigned_project_ids
      : raw.assignedProjectIds || [],
    password: row.password || raw.password || '',
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
  };
};

const mapIdeaFromDb = (row: any): Idea => {
  const raw = row.raw_data || {};
  return {
    id: row.id,
    title: row.title || raw.title || '',
    description: row.description || raw.description || '',
    category: row.category || raw.category || 'general',
    status: row.status || raw.status || 'idea',
    priority: row.priority || raw.priority || 'medium',
    tags: Array.isArray(row.tags) ? row.tags : raw.tags || [],
    notes: row.notes || raw.notes,
    relatedProjectId: row.related_project_id || raw.relatedProjectId,
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
  };
};

const mapNoteFromDb = (row: any): Note => {
  const raw = row.raw_data || {};
  return {
    id: row.id,
    title: row.title || raw.title || '',
    content: row.content || raw.content || '',
    tags: Array.isArray(row.tags) ? row.tags : raw.tags || [],
    linkedProjectId: row.linked_project_id || raw.linkedProjectId,
    linkedIdeaId: row.linked_idea_id || raw.linkedIdeaId,
    linkedClientId: row.linked_client_id || raw.linkedClientId,
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || raw.updatedAt || new Date().toISOString(),
  };
};

const mapAccountFromDb = (row: any): AccountTracker => {
  const raw = row.raw_data || {};
  return {
    id: row.id,
    service: row.service || raw.service || row.platform || '',
    email: row.email || raw.email || '',
    purpose: row.purpose || raw.purpose || row.metric_name || '',
    linkedProjectIds: Array.isArray(row.linked_project_ids)
      ? row.linked_project_ids
      : raw.linkedProjectIds || [],
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
  };
};

// ==========================================================
// Service Implementation
// ==========================================================
export const supabaseService = {
  // Check connectivity
  async ping(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error || error.code === 'PGRST116' || !error.message.includes('FetchError');
    } catch {
      return false;
    }
  },

  // Auth Operations
  async signUp(email: string, password: string, name: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'admin' },
      },
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getSession() {
    return await supabase.auth.getSession();
  },

  // Create a new Supabase Auth user for a team member (admin flow)
  // Uses signUp so the member can immediately log in with the provided password.
  async createMemberAuth(
    email: string,
    password: string,
    name: string,
    role: 'admin' | 'member'
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
          emailRedirectTo: window.location.origin,
        },
      });
      return { data, error };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  // Get the currently authenticated user
  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  },

  // Clients
  async fetchClients(): Promise<Client[] | null> {
    try {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) return null;
      return (data || []).map(mapClientFromDb);
    } catch {
      return null;
    }
  },

  async saveClient(client: Client): Promise<void> {
    try {
      await supabase.from('clients').upsert({
        id: client.id,
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
        approval_status: client.approvalStatus,
        rejection_reason: client.rejectionReason,
        created_by: client.createdBy,
        created_by_name: client.createdByName,
        created_at: client.createdAt,
        raw_data: client,
      });
    } catch (e) {
      console.warn('Supabase saveClient fallback:', e);
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      await supabase.from('clients').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteClient fallback:', e);
    }
  },

  // Projects
  async fetchProjects(): Promise<Project[] | null> {
    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) return null;
      return (data || []).map(mapProjectFromDb);
    } catch {
      return null;
    }
  },

  async saveProject(project: Project): Promise<void> {
    try {
      await supabase.from('projects').upsert({
        id: project.id,
        name: project.name,
        description: project.description,
        category: project.category,
        status: project.status,
        priority: project.priority,
        progress: project.progress,
        start_date: project.startDate,
        deadline: project.deadline,
        client_id: project.clientId,
        related_account_id: project.relatedAccountId,
        tags: project.tags,
        github_url: project.githubUrl,
        database_url: project.databaseUrl,
        database_type: project.databaseType,
        database_notes: project.databaseNotes,
        live_url: project.liveUrl,
        publish_url: project.publishUrl,
        figma_url: project.figmaUrl,
        plan_details: project.planDetails,
        plan_files: project.planFiles,
        approval_status: project.approvalStatus,
        rejection_reason: project.rejectionReason,
        created_by: project.createdBy,
        created_by_name: project.createdByName,
        created_at: project.createdAt,
        raw_data: project,
      });
    } catch (e) {
      console.warn('Supabase saveProject fallback:', e);
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteProject fallback:', e);
    }
  },

  // Tasks
  async fetchTasks(): Promise<Task[] | null> {
    try {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) return null;
      return (data || []).map(mapTaskFromDb);
    } catch {
      return null;
    }
  },

  async saveTask(task: Task): Promise<void> {
    try {
      await supabase.from('tasks').upsert({
        id: task.id,
        project_id: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        completed_at: task.completedAt,
        created_at: task.createdAt,
        raw_data: task,
      });
    } catch (e) {
      console.warn('Supabase saveTask fallback:', e);
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await supabase.from('tasks').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteTask fallback:', e);
    }
  },

  // Activities
  async fetchActivities(): Promise<Activity[] | null> {
    try {
      const { data, error } = await supabase.from('activities').select('*');
      if (error) return null;
      return (data || []).map(mapActivityFromDb);
    } catch {
      return null;
    }
  },

  async saveActivity(activity: Activity): Promise<void> {
    try {
      await supabase.from('activities').upsert({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        date: activity.date,
        start_time: activity.startTime,
        end_time: activity.endTime,
        duration_minutes: activity.durationMinutes,
        type: activity.type,
        project_id: activity.projectId,
        client_id: activity.clientId,
        tags: activity.tags,
        notes: activity.notes,
        completed: activity.completed,
        attachments: activity.attachments,
        created_at: activity.createdAt,
        raw_data: activity,
      });
    } catch (e) {
      console.warn('Supabase saveActivity fallback:', e);
    }
  },

  async deleteActivity(id: string): Promise<void> {
    try {
      await supabase.from('activities').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteActivity fallback:', e);
    }
  },

  // Ideas
  async fetchIdeas(): Promise<Idea[] | null> {
    try {
      const { data, error } = await supabase.from('ideas').select('*');
      if (error) return null;
      return (data || []).map(mapIdeaFromDb);
    } catch {
      return null;
    }
  },

  async saveIdea(idea: Idea): Promise<void> {
    try {
      await supabase.from('ideas').upsert({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        status: idea.status,
        priority: idea.priority,
        tags: idea.tags,
        notes: idea.notes,
        related_project_id: idea.relatedProjectId,
        created_at: idea.createdAt,
        raw_data: idea,
      });
    } catch (e) {
      console.warn('Supabase saveIdea fallback:', e);
    }
  },

  async deleteIdea(id: string): Promise<void> {
    try {
      await supabase.from('ideas').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteIdea fallback:', e);
    }
  },

  // Notes
  async fetchNotes(): Promise<Note[] | null> {
    try {
      const { data, error } = await supabase.from('notes').select('*');
      if (error) return null;
      return (data || []).map(mapNoteFromDb);
    } catch {
      return null;
    }
  },

  async saveNote(note: Note): Promise<void> {
    try {
      await supabase.from('notes').upsert({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        linked_project_id: note.linkedProjectId,
        linked_idea_id: note.linkedIdeaId,
        linked_client_id: note.linkedClientId,
        created_at: note.createdAt,
        updated_at: note.updatedAt,
        raw_data: note,
      });
    } catch (e) {
      console.warn('Supabase saveNote fallback:', e);
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      await supabase.from('notes').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteNote fallback:', e);
    }
  },

  // Accounts
  async fetchAccounts(): Promise<AccountTracker[] | null> {
    try {
      const { data, error } = await supabase.from('accounts').select('*');
      if (error) return null;
      return (data || []).map(mapAccountFromDb);
    } catch {
      return null;
    }
  },

  async saveAccount(account: AccountTracker): Promise<void> {
    try {
      await supabase.from('accounts').upsert({
        id: account.id,
        service: account.service,
        email: account.email,
        purpose: account.purpose,
        linked_project_ids: account.linkedProjectIds,
        created_at: account.createdAt,
        raw_data: account,
      });
    } catch (e) {
      console.warn('Supabase saveAccount fallback:', e);
    }
  },

  async deleteAccount(id: string): Promise<void> {
    try {
      await supabase.from('accounts').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteAccount fallback:', e);
    }
  },

  // Messages
  async fetchMessages(): Promise<TeamMessage[] | null> {
    try {
      const { data, error } = await supabase.from('messages').select('*');
      if (error) return null;
      return (data || []).map(mapMessageFromDb);
    } catch {
      return null;
    }
  },

  async saveMessage(msg: TeamMessage): Promise<void> {
    try {
      await supabase.from('messages').upsert({
        id: msg.id,
        sender_id: msg.senderId,
        sender_name: msg.senderName,
        sender_email: msg.senderEmail,
        sender_role: msg.senderRole,
        recipient_id: msg.recipientId,
        recipient_name: msg.recipientName,
        recipient_email: msg.recipientEmail,
        subject: msg.subject,
        content: msg.content,
        read: msg.read,
        related_project_id: msg.relatedProjectId,
        related_client_id: msg.relatedClientId,
        created_at: msg.createdAt,
        raw_data: msg,
      });
    } catch (e) {
      console.warn('Supabase saveMessage fallback:', e);
    }
  },

  async deleteMessage(id: string): Promise<void> {
    try {
      await supabase.from('messages').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteMessage fallback:', e);
    }
  },

  // Team Members
  async fetchTeamMembers(): Promise<TeamMember[] | null> {
    try {
      const { data, error } = await supabase.from('team_members').select('*');
      if (error) return null;
      return (data || []).map(mapMemberFromDb);
    } catch {
      return null;
    }
  },

  async saveTeamMember(member: TeamMember): Promise<void> {
    try {
      await supabase.from('team_members').upsert({
        id: member.id,
        name: member.name,
        email: member.email,
        password: member.password,
        role: member.role,
        title: member.title,
        assigned_client_ids: member.assignedClientIds,
        assigned_project_ids: member.assignedProjectIds,
        created_at: member.createdAt,
        raw_data: member,
      });
    } catch (e) {
      console.warn('Supabase saveTeamMember fallback:', e);
    }
  },

  async deleteTeamMember(id: string): Promise<void> {
    try {
      await supabase.from('team_members').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteTeamMember fallback:', e);
    }
  },
};

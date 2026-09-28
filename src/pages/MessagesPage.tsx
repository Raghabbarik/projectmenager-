import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  Mail,
  Send,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Building2,
  FolderGit2,
  Clock,
  User,
  Shield,
  MessageSquare,
  Reply,
} from 'lucide-react';
import { SendMessageModal } from '../components/messages/SendMessageModal';
import { EmptyState } from '../components/common/EmptyState';
import { TeamMessage } from '../types';

export const MessagesPage: React.FC = () => {
  const {
    messages,
    user,
    isAdmin,
    isMember,
    currentMember,
    markMessageRead,
    deleteMessage,
    projects,
    clients,
    navigateTo,
  } = useJourney();

  const [activeTab, setActiveTab] = useState<'all' | 'inbox' | 'sent' | 'unread'>('inbox');
  const [search, setSearch] = useState('');
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [replyConfig, setReplyConfig] = useState<{
    recipientId?: string;
    subject?: string;
    projectId?: string;
    clientId?: string;
  }>({});

  const userEmail = (user.email || '').toLowerCase();

  // Filter messages relevant to current user
  const userMessages = messages.filter((m) => {
    if (isAdmin) {
      // Admins see all sent & received messages or broadcasts
      return true;
    }
    // Members see messages addressed to them, or to 'all', or sent by them
    const isRecipient =
      m.recipientId === 'all' ||
      m.recipientId.toLowerCase() === userEmail ||
      m.recipientEmail?.toLowerCase() === userEmail ||
      (currentMember && m.recipientId === currentMember.id);
    const isSender = m.senderEmail.toLowerCase() === userEmail;
    return isRecipient || isSender;
  });

  const tabFilteredMessages = userMessages.filter((m) => {
    const isSentByMe = m.senderEmail.toLowerCase() === userEmail;
    if (activeTab === 'sent') return isSentByMe;
    if (activeTab === 'inbox') return !isSentByMe;
    if (activeTab === 'unread') return !m.read && !isSentByMe;
    return true;
  });

  const searchFilteredMessages = tabFilteredMessages.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.subject.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      m.senderName.toLowerCase().includes(q) ||
      (m.recipientName || '').toLowerCase().includes(q)
    );
  });

  const unreadCount = userMessages.filter(
    (m) => !m.read && m.senderEmail.toLowerCase() !== userEmail
  ).length;

  const handleOpenCompose = (recipientId?: string, subject?: string, projectId?: string, clientId?: string) => {
    setReplyConfig({
      recipientId,
      subject,
      projectId,
      clientId,
    });
    setSendModalOpen(true);
  };

  const handleReply = (m: TeamMessage) => {
    handleOpenCompose(
      m.senderEmail,
      m.subject.startsWith('Re: ') ? m.subject : `Re: ${m.subject}`,
      m.relatedProjectId,
      m.relatedClientId
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Banner for Members */}
      {isMember && (
        <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3 text-xs text-indigo-800 dark:text-indigo-300">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              <strong>Member Inbox:</strong> Review instructions, client allocation updates, and approval confirmations sent directly by the Admin.
            </span>
          </div>
          {unreadCount > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-600 text-white font-semibold shrink-0">
              {unreadCount} Unread
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {isAdmin ? 'Team Messages & Announcements' : 'Admin Messages'}
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isAdmin
              ? 'Send direct messages, announcements, and deliverable feedback to members'
              : 'Direct communication channel between you and the system administrator'}
          </p>
        </div>

        <button
          onClick={() => handleOpenCompose()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isAdmin ? 'Send Message to Member' : 'Message Admin'}</span>
        </button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'inbox'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Inbox ({userMessages.filter((m) => m.senderEmail.toLowerCase() !== userEmail).length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'unread'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sent'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Sent ({userMessages.filter((m) => m.senderEmail.toLowerCase() === userEmail).length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            All ({userMessages.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Messages List */}
      {searchFilteredMessages.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No messages found"
          description={
            activeTab === 'unread'
              ? 'You are all caught up! No unread messages.'
              : 'Communicate project updates and client guidelines with team members.'
          }
          actionLabel={isAdmin ? 'Send First Message' : undefined}
          onAction={isAdmin ? () => handleOpenCompose() : undefined}
        />
      ) : (
        <div className="space-y-3">
          {searchFilteredMessages.map((msg) => {
            const isSentByMe = msg.senderEmail.toLowerCase() === userEmail;
            const isUnread = !msg.read && !isSentByMe;
            const relatedProject = projects.find((p) => p.id === msg.relatedProjectId);
            const relatedClient = clients.find((c) => c.id === msg.relatedClientId);

            return (
              <div
                key={msg.id}
                onClick={() => {
                  if (isUnread) markMessageRead(msg.id);
                }}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isUnread
                    ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 shadow-sm'
                    : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Message Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-100 dark:border-neutral-800/80 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {msg.senderName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {msg.senderName}
                        </span>
                        {msg.senderRole === 'admin' ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 uppercase">
                            Admin
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 uppercase">
                            Member
                          </span>
                        )}
                        {isUnread && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        To: {msg.recipientName || msg.recipientId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 self-end sm:self-auto">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Subject & Body */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {msg.subject}
                  </h3>
                  <div className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>

                {/* Attached Links (Project / Client) */}
                {(relatedProject || relatedClient) && (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400">
                      Linked Context:
                    </span>
                    {relatedProject && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('project-detail', relatedProject.id);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        <FolderGit2 className="w-3 h-3 text-indigo-500" />
                        <span>Project: {relatedProject.name}</span>
                      </button>
                    )}
                    {relatedClient && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('clients');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        <Building2 className="w-3 h-3 text-emerald-500" />
                        <span>Client: {relatedClient.company}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReply(msg);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer font-medium"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                    {isUnread && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markMessageRead(msg.id);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Read</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(msg.id);
                    }}
                    className="p-1 rounded text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compose/Reply Modal */}
      <SendMessageModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        prefillRecipientId={replyConfig.recipientId}
        prefillSubject={replyConfig.subject}
        prefillProjectId={replyConfig.projectId}
        prefillClientId={replyConfig.clientId}
      />
    </div>
  );
};

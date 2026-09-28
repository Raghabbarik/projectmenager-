import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import {
  Sparkles,
  Send,
  HelpCircle,
  Clock,
  FolderGit2,
  Brain,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { formatDuration } from '../components/activities/ActivityCard';

export const AiAssistantPage: React.FC = () => {
  const { activities, projects, notes, ideas, tasks } = useJourney();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; details?: string[] }[]
  >([
    {
      role: 'assistant',
      text: 'Hello Alex. I am your private Journey Assistant. I analyze your actual recorded activities, projects, and notes to help you reflect on what you learned and built—without judging your life or inventing arbitrary scores.',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const suggestedQuestions = [
    'Can I complete my work today?',
    'Summarize my September',
    'What did I learn this week?',
    'What projects did I work on?',
    'Find my notes about Firebase',
  ];

  const handleAsk = (queryText: string) => {
    const q = (queryText || prompt).trim();
    if (!q) return;

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setPrompt('');
    setIsThinking(true);

    setTimeout(() => {
      let reply = '';
      let details: string[] = [];

      const lower = q.toLowerCase();
      if (lower.includes('complete') || lower.includes('finish') || (lower.includes('work') && lower.includes('today'))) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayActs = activities.filter((a) => a.date === todayStr);
        const loggedMins = todayActs.reduce((acc, a) => acc + a.durationMinutes, 0);
        const pendingTasks = tasks.filter((t) => (t.dueDate === todayStr || t.status === 'in_progress') && t.status !== 'completed');
        const doneTasks = tasks.filter((t) => t.completedAt && t.completedAt.slice(0, 10) === todayStr);
        const activeCategories = Array.from(new Set(todayActs.map(a => a.type))).map(t => `${t}: ${formatDuration(todayActs.filter(a => a.type === t).reduce((acc, a) => acc + a.durationMinutes, 0))}`).join(', ');

        reply = `Yes, your workload status is actively tracked! You have logged ${formatDuration(loggedMins)} of focused time across ${todayActs.length} sessions today. Here is your current workload status:`;
        details = [
          `Time logged today: ${formatDuration(loggedMins)}${activeCategories ? ` (${activeCategories})` : ' (No sessions recorded today yet)'}`,
          `Tasks completed today: ${doneTasks.length} task${doneTasks.length !== 1 ? 's' : ''} finished`,
          `Remaining items: ${pendingTasks.length} active task${pendingTasks.length !== 1 ? 's' : ''} (${pendingTasks.map(t => `"${t.title}"`).join(', ') || 'None'})`,
          `Estimated time needed: ~${formatDuration(pendingTasks.length * 45)} to complete remaining work`,
          `Feasibility: ${pendingTasks.length === 0 ? 'All scheduled work completed! 🎉' : 'On track to wrap up smoothly.'}`,
        ];
      } else if (lower.includes('september') || lower.includes('summarize')) {
        const septActivities = activities.filter((a) => a.date.startsWith('2026-09'));
        const totalMinutes = septActivities.reduce((acc, a) => acc + a.durationMinutes, 0);
        reply = `During September 2026, you recorded ${septActivities.length} activities totaling ${formatDuration(
          totalMinutes
        )}. Key areas of focus included:`;
        details = [
          'Reading: Atomic Habits (cue design & habit friction)',
          'Learning: Firebase Authentication security rules, Raft Consensus algorithm',
          'Building: My Journey Dashboard UI, Kanban boards, and timeline engine',
          'Client Work: ABC Technologies web portal updates & optimization',
        ];
      } else if (lower.includes('learn') || lower.includes('learned')) {
        const learningActs = activities.filter(
          (a) => a.type === 'learning' || a.type === 'reading'
        );
        reply = `Here is what you recorded studying and reading recently:`;
        details = learningActs.slice(0, 5).map(
          (a) =>
            `${a.title} (${formatDuration(a.durationMinutes)}) — ${a.description || 'Focused study'}`
        );
      } else if (lower.includes('project') || lower.includes('unfinished')) {
        const inProgress = projects.filter((p) => p.status === 'in_progress');
        reply = `You currently have ${inProgress.length} active projects in progress:`;
        details = inProgress.map(
          (p) => `${p.name} (${p.progress}% complete, deadline: ${p.deadline || 'flexible'})`
        );
      } else if (lower.includes('firebase')) {
        const firebaseNotes = notes.filter(
          (n) =>
            n.title.toLowerCase().includes('firebase') ||
            n.content.toLowerCase().includes('firebase')
        );
        reply = `Found ${firebaseNotes.length} notes referring to Firebase:`;
        details = firebaseNotes.map((n) => `"${n.title}": ${n.content.slice(0, 90)}...`);
      } else {
        reply = `Based on your ${activities.length} recorded activities and ${projects.length} projects, you have maintained steady momentum in learning and building.`;
        details = [
          `Total time logged: ${formatDuration(
            activities.reduce((acc, a) => acc + a.durationMinutes, 0)
          )}`,
          `Active projects: ${projects.filter((p) => p.status === 'in_progress').map((p) => p.name).join(', ')}`,
        ];
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply, details }]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Journey Assistant
          </h1>
        </div>
        <p className="text-xs text-neutral-500">
          Query your personal journey data, recall notes, and summarize historical activity
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-2">
        <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
          Suggested Reflection Queries
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600 hover:text-neutral-900 transition-colors text-left cursor-pointer"
            >
              • {q}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4 min-h-[320px]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-xl p-4 rounded-xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-tr-xs'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-xs rounded-tl-xs'
              }`}
            >
              <p>{m.text}</p>
              {m.details && m.details.length > 0 && (
                <ul className="mt-2.5 pt-2 border-t border-neutral-150 dark:border-neutral-800 space-y-1 text-neutral-600 dark:text-neutral-400">
                  {m.details.map((d, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold shrink-0">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 animate-pulse pl-11">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyzing your journey archive...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="relative pt-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk(prompt)}
          placeholder="Ask about your recorded activities, projects, or notes..."
          className="w-full pl-4 pr-12 py-3 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
        <button
          onClick={() => handleAsk(prompt)}
          className="absolute right-2 top-4 p-2 text-neutral-400 hover:text-indigo-600 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Privacy Marker */}
      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Analyzes your private client-side data only. No external profiling.</span>
      </div>
    </div>
  );
};

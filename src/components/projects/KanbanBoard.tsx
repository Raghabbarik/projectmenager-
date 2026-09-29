import React, { useState } from 'react';
import { Task, TaskStatus, PriorityLevel } from '../../types';
import { useJourney } from '../../context/JourneyContext';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  MoreVertical,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface KanbanBoardProps {
  projectId: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete } = useJourney();

  const [newTaskColumn, setNewTaskColumn] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const projectTasks = tasks.filter(
    (t) => t.projectId === projectId && t.projectId !== 'personal' && !t.isPersonal
  );

  const columns: { status: TaskStatus; label: string; count: number }[] = [
    { status: 'todo', label: 'Todo', count: projectTasks.filter((t) => t.status === 'todo').length },
    { status: 'in_progress', label: 'In Progress', count: projectTasks.filter((t) => t.status === 'in_progress').length },
    { status: 'completed', label: 'Completed', count: projectTasks.filter((t) => t.status === 'completed').length },
  ];

  const handleCreateTask = (status: TaskStatus) => {
    if (!newTitle.trim()) return;
    addTask({
      projectId,
      isPersonal: false,
      title: newTitle.trim(),
      status,
      priority: newPriority,
      dueDate: newDueDate || undefined,
    });
    setNewTitle('');
    setNewDueDate('');
    setNewTaskColumn(null);
  };

  const getPriorityIndicator = (p: PriorityLevel) => {
    switch (p) {
      case 'high':
        return 'text-rose-600 dark:text-rose-400';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-neutral-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = projectTasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 p-3 min-h-[360px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-neutral-200/60 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  {col.label}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {col.count}
                </span>
              </div>
              <button
                onClick={() => setNewTaskColumn(col.status)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
                title="Add task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Inline Task Creator */}
            {newTaskColumn === col.status && (
              <div className="p-3 my-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm space-y-2 animate-in fade-in duration-100">
                <input
                  type="text"
                  autoFocus
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(col.status)}
                  className="w-full text-xs bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
                />
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="text-[10px] bg-transparent text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewTaskColumn(null)}
                      className="px-2 py-1 text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateTask(col.status)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Task Card List */}
            <div className="flex-1 space-y-2 mt-3 overflow-y-auto">
              {colTasks.length === 0 && newTaskColumn !== col.status ? (
                <div className="h-28 flex items-center justify-center text-[11px] text-neutral-400 dark:text-neutral-500 italic">
                  No tasks in {col.label.toLowerCase()}
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group relative p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="mt-0.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-medium leading-snug ${
                            task.status === 'completed'
                              ? 'line-through text-neutral-400 dark:text-neutral-500'
                              : 'text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          {task.title}
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-400 font-mono">
                          <span className={`capitalize font-medium ${getPriorityIndicator(task.priority)}`}>
                            {task.priority}
                          </span>

                          {task.dueDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {task.dueDate.slice(5)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Dropdown status shift */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTask(task.id, {
                              status: e.target.value as TaskStatus,
                              completedAt:
                                e.target.value === 'completed'
                                  ? new Date().toISOString()
                                  : undefined,
                            })
                          }
                          className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded px-1 py-0.5 border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                        >
                          <option value="todo">Todo</option>
                          <option value="in_progress">Doing</option>
                          <option value="completed">Done</option>
                        </select>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

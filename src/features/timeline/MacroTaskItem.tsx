import React from 'react';
import { MacroTask } from '../../types/timeline';
import { StatusDot } from '../../components/ui/StatusDot';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';

interface MacroTaskItemProps {
  task: MacroTask;
  onToggle: (taskId: string, currentCompleted: boolean) => void;
  onDelete: (taskId: string) => void;
}

export const MacroTaskItem: React.FC<MacroTaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <div className="flex items-start justify-between p-3 text-xs gap-3 hover:bg-stone-50/50 dark:hover:bg-white/[0.02] transition-colors">
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <button
          onClick={() => onToggle(task.id, task.completed)}
          className="mt-0.5 shrink-0 focus:outline-none"
          aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
        >
          {task.completed ? (
            <CheckCircle2 className="w-4 h-4 text-[#10B981] stroke-[1.5]" />
          ) : (
            <Circle className="w-4 h-4 text-stone-300 dark:text-zinc-600 stroke-[1.5]" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <span
            className={`block leading-snug break-words ${
              task.completed
                ? 'text-stone-500 dark:text-[#8B8B93]'
                : 'text-[#111113] dark:text-[#EDEDEF] font-medium'
            }`}
          >
            {task.title}
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-zinc-500 mt-0.5">
            <span className="tabular-nums">Due {task.dueDate}</span>
            <span>·</span>
            <span>{task.assignee}</span>
            <span>·</span>
            <span>{task.category}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 pt-0.5">
        {task.priority === 'critical' ? (
          <StatusDot status="red" label="Critical" />
        ) : task.priority === 'high' ? (
          <StatusDot status="amber" label="High" />
        ) : (
          <span className="text-xs text-stone-500 dark:text-zinc-500">Normal</span>
        )}

        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-1 text-stone-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          aria-label={`Delete task ${task.title}`}
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
};


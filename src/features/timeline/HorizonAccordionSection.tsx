import React from 'react';
import { TimelineHorizon, MacroTask } from '../../types/timeline';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MacroTaskItem } from './MacroTaskItem';

export const HORIZON_LABELS: Record<TimelineHorizon, string> = {
  '6_months': '6+ months out — Architectural milestones',
  '3_months': '3 months out — Core design & sourcing',
  '1_month': '1 month out — Operational refinement',
  '1_week': '1 week out — Production locks & logistics',
  'day_before': 'Day before — Rehearsals & final readiness',
};

interface HorizonAccordionSectionProps {
  horizon: TimelineHorizon;
  tasks: MacroTask[];
  isCollapsed: boolean;
  onToggleCollapse: (horizon: TimelineHorizon) => void;
  onToggleTask: (taskId: string, currentCompleted: boolean) => void;
  onDeleteTask: (taskId: string) => void;
}

export const HorizonAccordionSection: React.FC<HorizonAccordionSectionProps> = ({
  horizon,
  tasks,
  isCollapsed,
  onToggleCollapse,
  onToggleTask,
  onDeleteTask,
}) => {
  if (tasks.length === 0) return null;

  const completedCount = tasks.filter((t) => t.completed).length;
  const isAllCompleted = completedCount === tasks.length && tasks.length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113]">
      <button
        onClick={() => onToggleCollapse(horizon)}
        aria-expanded={!isCollapsed}
        className="w-full flex items-center justify-between p-3.5 hover:bg-stone-50/60 dark:hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-stone-400 stroke-[1.5] shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400 stroke-[1.5] shrink-0" />
          )}
          <h3 className="text-sm font-medium tracking-tight text-[#111113] dark:text-[#EDEDEF]">
            {HORIZON_LABELS[horizon]}
          </h3>
        </div>

        <span className="text-xs tabular-nums text-stone-400 dark:text-zinc-500">
          {completedCount} of {tasks.length} done {isAllCompleted ? '· Complete' : ''}
        </span>
      </button>

      {!isCollapsed && (
        <div className="divide-y divide-stone-200/60 dark:divide-white/[0.04] border-t border-stone-200/80 dark:border-white/[0.08]">
          {tasks.map((task) => (
            <MacroTaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

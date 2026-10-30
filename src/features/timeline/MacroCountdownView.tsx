import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { StatusDot } from '../../components/ui/StatusDot';
import { TimelineHorizon } from '../../types/timeline';
import { AddMacroTaskModal } from './AddMacroTaskModal';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

const horizonLabels: Record<TimelineHorizon, string> = {
  '6_months': '6+ months out — Architectural milestones',
  '3_months': '3 months out — Core design & sourcing',
  '1_month': '1 month out — Operational refinement',
  '1_week': '1 week out — Production locks & logistics',
  'day_before': 'Day before — Rehearsals & final readiness',
};

const horizonsOrder: TimelineHorizon[] = [
  '6_months',
  '3_months',
  '1_month',
  '1_week',
  'day_before',
];

export const MacroCountdownView: React.FC = () => {
  const { state, updateMacroTask, addMacroTask, deleteMacroTask } = useWorkspace();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(state.macroTasks.map((t) => t.category))),
    [state.macroTasks]
  );

  const filteredTasks = useMemo(() => {
    if (selectedCategory === 'all') return state.macroTasks;
    const lower = selectedCategory.toLowerCase();
    return state.macroTasks.filter((t) => t.category.toLowerCase() === lower);
  }, [state.macroTasks, selectedCategory]);

  const tasksByHorizon = useMemo(() => {
    const map = new Map<TimelineHorizon, typeof filteredTasks>();
    horizonsOrder.forEach((h) => {
      map.set(h, filteredTasks.filter((t) => t.horizon === h));
    });
    return map;
  }, [filteredTasks]);

  // Collapse completed phases by default; auto-expand current in-progress phase
  const [collapsedHorizons, setCollapsedHorizons] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    horizonsOrder.forEach((h) => {
      const tasks = state.macroTasks.filter((t) => t.horizon === h);
      const isComplete = tasks.length > 0 && tasks.every((t) => t.completed);
      initial[h] = isComplete;
    });
    return initial;
  });

  const toggleHorizon = (h: string) => {
    setCollapsedHorizons((prev) => ({ ...prev, [h]: !prev[h] }));
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Row & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80 dark:border-white/[0.08]">
        {/* Quiet text buttons filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#111113] dark:text-[#EDEDEF] font-medium'
                : 'text-stone-500 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF]'
            }`}
          >
            All categories ({state.macroTasks.length})
          </button>
          {categories.map((cat) => {
            const count = state.macroTasks.filter((t) => t.category === cat).length;
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#111113] dark:text-[#EDEDEF] font-medium'
                    : 'text-stone-500 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-xs text-stone-500 dark:text-[#8B8B93] tabular-nums">
            {filteredTasks.filter((t) => t.completed).length} of {filteredTasks.length} complete
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus />}
          >
            Add milestone
          </Button>
        </div>
      </div>

      {/* Grouped Horizon Accordions */}
      {filteredTasks.length === 0 ? (
        <Card className="p-8 text-center text-xs text-stone-500 dark:text-[#8B8B93] rounded-xl border border-stone-200/80 dark:border-white/[0.08]">
          No scheduled milestones matching this category filter.
        </Card>
      ) : (
        <div className="space-y-3">
          {horizonsOrder.map((horizon) => {
            const horizonTasks = tasksByHorizon.get(horizon) || [];
            if (horizonTasks.length === 0) return null;

            const completedCount = horizonTasks.filter((t) => t.completed).length;
            const isAllCompleted = completedCount === horizonTasks.length && horizonTasks.length > 0;
            const isCollapsed = Boolean(collapsedHorizons[horizon]);

            return (
              <div
                key={horizon}
                className="overflow-hidden rounded-xl border border-stone-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113]"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleHorizon(horizon)}
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
                      {horizonLabels[horizon]}
                    </h3>
                  </div>

                  <span className="text-xs tabular-nums text-stone-400 dark:text-zinc-500">
                    {completedCount} of {horizonTasks.length} done {isAllCompleted ? '· Complete' : ''}
                  </span>
                </button>

                {/* Tasks List */}
                {!isCollapsed && (
                  <div className="divide-y divide-stone-200/60 dark:divide-white/[0.04] border-t border-stone-200/80 dark:border-white/[0.08]">
                    {horizonTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start justify-between p-3 text-xs gap-3 hover:bg-stone-50/50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <button
                            onClick={() => updateMacroTask(task.id, { completed: !task.completed })}
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
                                  ? 'text-stone-400 dark:text-[#8B8B93]'
                                  : 'text-[#111113] dark:text-[#EDEDEF] font-medium'
                              }`}
                            >
                              {task.title}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 dark:text-zinc-500 mt-0.5">
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
                            <span className="text-xs text-stone-400 dark:text-zinc-500">Normal</span>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteMacroTask(task.id)}
                            className="p-1 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            aria-label={`Delete task ${task.title}`}
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddMacroTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={addMacroTask}
        defaultDate={state.event.date}
      />
    </div>
  );
};

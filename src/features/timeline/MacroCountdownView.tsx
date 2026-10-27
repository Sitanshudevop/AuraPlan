import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TimelineHorizon, Priority } from '../../types/timeline';
import { CheckCircle2, Circle, Clock, User } from 'lucide-react';

const horizonLabels: Record<TimelineHorizon, string> = {
  '6_months': '6+ Months Out — Architectural Milestones',
  '3_months': '3 Months Out — Core Design & Sourcing',
  '1_month': '1 Month Out — Operational Refinement',
  '1_week': '1 Week Out — Production Locks & Logistics',
  'day_before': 'Day Before — Rehearsals & Final Readiness',
};

const horizonsOrder: TimelineHorizon[] = [
  '6_months',
  '3_months',
  '1_month',
  '1_week',
  'day_before',
];

export const MacroCountdownView: React.FC = () => {
  const { state, updateMacroTask } = useWorkspace();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const getPriorityVariant = (p: Priority) => {
    if (p === 'critical') return 'rose';
    if (p === 'high') return 'amber';
    return 'stone';
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[#18181B] text-white dark:bg-white dark:text-stone-900 shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#18181B] text-white dark:bg-white dark:text-stone-900 shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Horizons Grouping */}
      {filteredTasks.length === 0 ? (
        <Card className="p-8 text-center text-xs text-stone-400">
          No scheduled milestones matching this category filter.
        </Card>
      ) : (
        <div className="space-y-5">
          {horizonsOrder.map((horizon) => {
            const horizonTasks = tasksByHorizon.get(horizon) || [];
            if (horizonTasks.length === 0) return null;

            const completedCount = horizonTasks.filter((t) => t.completed).length;

            return (
              <Card key={horizon} className="space-y-3 p-4">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-zinc-200">
                      {horizonLabels[horizon]}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-stone-500">
                    {completedCount} / {horizonTasks.length} Completed
                  </span>
                </div>

                <div className="space-y-1.5">
                  {horizonTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all text-xs ${
                        task.completed
                          ? 'bg-stone-50/40 dark:bg-zinc-900/20 border-stone-100 dark:border-zinc-800/40 opacity-70'
                          : 'bg-white dark:bg-zinc-900/60 border-stone-200 dark:border-zinc-800 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => updateMacroTask(task.id, { completed: !task.completed })}
                          className="shrink-0 focus:outline-none"
                          aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-stone-300 hover:text-stone-500 dark:text-zinc-600" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <span
                            className={`font-medium block truncate ${
                              task.completed ? 'line-through text-stone-400 dark:text-zinc-500' : 'text-stone-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                            <span className="font-mono tabular-nums">Due: {task.dueDate}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.assignee}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="stone" size="sm">
                          {task.category}
                        </Badge>
                        <Badge variant={getPriorityVariant(task.priority)} size="sm">
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

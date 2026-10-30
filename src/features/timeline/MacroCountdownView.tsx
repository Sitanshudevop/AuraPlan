import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TimelineHorizon, Priority } from '../../types/timeline';
import { AddMacroTaskModal } from './AddMacroTaskModal';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, Circle, Clock, User, ChevronDown, ChevronRight, Filter, Plus, Trash2 } from 'lucide-react';

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
  const { state, updateMacroTask, addMacroTask, deleteMacroTask } = useWorkspace();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Track open/collapsed state for horizons
  const [collapsedHorizons, setCollapsedHorizons] = useState<Record<string, boolean>>({
    '6_months': true, // Collapsed by default as completed
  });

  const toggleHorizon = (h: string) => {
    setCollapsedHorizons((prev) => ({ ...prev, [h]: !prev[h] }));
  };

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
      {/* Category Filter Dropdown Bar */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-stone-50/70 dark:bg-zinc-900/40 border border-stone-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
            Filter Milestones:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter milestones by category"
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Milestone Categories ({state.macroTasks.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({state.macroTasks.filter((t) => t.category === cat).length})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Milestone
          </Button>
          <div className="text-xs text-stone-500 dark:text-zinc-400 font-mono tabular-nums">
            {filteredTasks.filter((t) => t.completed).length} / {filteredTasks.length} Completed
          </div>
        </div>
      </div>

      {/* Horizons Grouping Accordions */}
      {filteredTasks.length === 0 ? (
        <Card className="p-8 text-center text-xs text-stone-600 dark:text-zinc-400 rounded-2xl">
          No scheduled milestones matching this category filter.
        </Card>
      ) : (
        <div className="space-y-4">
          {horizonsOrder.map((horizon) => {
            const horizonTasks = tasksByHorizon.get(horizon) || [];
            if (horizonTasks.length === 0) return null;

            const completedCount = horizonTasks.filter((t) => t.completed).length;
            const isAllCompleted = completedCount === horizonTasks.length && horizonTasks.length > 0;
            const isCollapsed = Boolean(collapsedHorizons[horizon]);

            return (
              <Card key={horizon} className="overflow-hidden p-0 rounded-2xl border-stone-200 dark:border-zinc-800">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleHorizon(horizon)}
                  aria-expanded={!isCollapsed}
                  className="w-full flex items-center justify-between p-4 bg-stone-50/60 dark:bg-zinc-900/60 hover:bg-stone-100/60 dark:hover:bg-zinc-800/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                    <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-zinc-200">
                      {horizonLabels[horizon]}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md ${
                      isAllCompleted
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-stone-500 dark:text-zinc-400'
                    }`}>
                      {completedCount} / {horizonTasks.length} done {isAllCompleted ? '✓' : ''}
                    </span>
                  </div>
                </button>

                {/* Accordion Task List */}
                {!isCollapsed && (
                  <div className="p-4 space-y-2 border-t border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
                    {horizonTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-start justify-between p-3 rounded-xl border transition-all text-xs gap-3 ${
                          task.completed
                            ? 'bg-stone-50/50 dark:bg-zinc-900/20 border-stone-200/60 dark:border-zinc-800/40 opacity-75'
                            : 'bg-white dark:bg-zinc-900/60 border-stone-200 dark:border-zinc-800 hover:border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => updateMacroTask(task.id, { completed: !task.completed })}
                            className="mt-0.5 shrink-0 focus:outline-none"
                            aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-stone-300 hover:text-stone-500 dark:text-zinc-600" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <span
                              className={`font-medium block leading-snug break-words ${
                                task.completed ? 'text-stone-500 dark:text-zinc-400' : 'text-stone-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 dark:text-zinc-400 mt-1">
                              <span className="font-mono tabular-nums">Due: {task.dueDate}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-stone-500 dark:text-zinc-400">
                                <User className="w-3 h-3 text-stone-400" />
                                {task.assignee}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-0.5">
                          <Badge variant="stone" size="sm">
                            {task.category}
                          </Badge>
                          <Badge variant={getPriorityVariant(task.priority)} size="sm">
                            {task.priority.toUpperCase()}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => deleteMacroTask(task.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                            aria-label={`Delete task ${task.title}`}
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Milestone Task Modal */}
      <AddMacroTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={addMacroTask}
        defaultDate={state.event.date}
      />
    </div>
  );
};

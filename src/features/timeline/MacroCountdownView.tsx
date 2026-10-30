import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { TimelineHorizon } from '../../types/timeline';
import { AddMacroTaskModal } from './AddMacroTaskModal';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import { HorizonAccordionSection } from './HorizonAccordionSection';

const HORIZONS_ORDER: TimelineHorizon[] = [
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
    HORIZONS_ORDER.forEach((h) => {
      map.set(h, filteredTasks.filter((t) => t.horizon === h));
    });
    return map;
  }, [filteredTasks]);

  // Collapse completed phases by default; auto-expand current in-progress phase
  const [collapsedHorizons, setCollapsedHorizons] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    HORIZONS_ORDER.forEach((h) => {
      const tasks = state.macroTasks.filter((t) => t.horizon === h);
      const isComplete = tasks.length > 0 && tasks.every((t) => t.completed);
      initial[h] = isComplete;
    });
    return initial;
  });

  const toggleHorizon = (h: TimelineHorizon) => {
    setCollapsedHorizons((prev) => ({ ...prev, [h]: !prev[h] }));
  };

  const handleToggleTask = (taskId: string, currentCompleted: boolean) => {
    updateMacroTask(taskId, { completed: !currentCompleted });
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Row & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80 dark:border-white/[0.08]">
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
          {HORIZONS_ORDER.map((horizon) => (
            <HorizonAccordionSection
              key={horizon}
              horizon={horizon}
              tasks={tasksByHorizon.get(horizon) || []}
              isCollapsed={Boolean(collapsedHorizons[horizon])}
              onToggleCollapse={toggleHorizon}
              onToggleTask={handleToggleTask}
              onDeleteTask={deleteMacroTask}
            />
          ))}
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

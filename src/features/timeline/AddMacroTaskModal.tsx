import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select, SelectOption } from '../../components/ui/Select';
import { MacroTask, TimelineHorizon, Priority } from '../../types/timeline';
import { useAddMacroTaskForm } from './useAddMacroTaskForm';

interface AddMacroTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: MacroTask) => void;
  defaultDate: string;
}

export const MACRO_HORIZON_OPTIONS: SelectOption[] = [
  { value: '6_months', label: '6+ months out (architectural)' },
  { value: '3_months', label: '3 months out (design & sourcing)' },
  { value: '1_month', label: '1 month out (operational)' },
  { value: '1_week', label: '1 week out (production locks)' },
  { value: 'day_before', label: 'Day before (final readiness)' },
];

export const MACRO_PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'critical', label: 'Critical', dotColor: 'bg-rose-500' },
  { value: 'high', label: 'High priority', dotColor: 'bg-amber-500' },
  { value: 'normal', label: 'Standard priority', dotColor: 'bg-stone-400' },
];

export const AddMacroTaskModal: React.FC<AddMacroTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  defaultDate,
}) => {
  const form = useAddMacroTaskForm({ defaultDate, onAddTask, onClose });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add milestone task"
      description="Schedule an operational deadline across your planning horizon."
      maxWidth="md"
    >
      <form onSubmit={form.handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="task-title" className="block text-muted font-medium mb-1">
            Milestone title
          </label>
          <input
            id="task-title"
            type="text"
            required
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
            placeholder="e.g. Conduct generator load test and sound licensing check"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">Planning horizon</label>
            <Select
              value={form.horizon}
              onChange={(val) => form.setHorizon(val as TimelineHorizon)}
              options={MACRO_HORIZON_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Priority level</label>
            <Select
              value={form.priority}
              onChange={(val) => form.setPriority(val as Priority)}
              options={MACRO_PRIORITY_OPTIONS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-cat" className="block text-muted font-medium mb-1">Category</label>
            <input
              id="task-cat"
              type="text"
              required
              value={form.category}
              onChange={(e) => form.setCategory(e.target.value)}
              placeholder="e.g. Permits & Safety, Decor, AV Photo"
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="task-assignee" className="block text-muted font-medium mb-1">Assignee</label>
            <input
              id="task-assignee"
              type="text"
              required
              value={form.assignee}
              onChange={(e) => form.setAssignee(e.target.value)}
              placeholder="e.g. Lead Coordinator, Banquet Captain"
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="task-due" className="block text-muted font-medium mb-1">Target due date</label>
          <input
            id="task-due"
            type="date"
            required
            value={form.dueDate}
            onChange={(e) => form.setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-hairline">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Add milestone
          </Button>
        </div>
      </form>
    </Modal>
  );
};

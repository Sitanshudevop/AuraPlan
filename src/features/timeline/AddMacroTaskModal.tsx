import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select, SelectOption } from '../../components/ui/Select';
import { MacroTask, TimelineHorizon, Priority } from '../../types/timeline';
import { sanitizeInput } from '../../utils/sanitizer';

interface AddMacroTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: MacroTask) => void;
  defaultDate: string;
}

const horizonOptions: SelectOption[] = [
  { value: '6_months', label: '6+ months out (architectural)' },
  { value: '3_months', label: '3 months out (design & sourcing)' },
  { value: '1_month', label: '1 month out (operational)' },
  { value: '1_week', label: '1 week out (production locks)' },
  { value: 'day_before', label: 'Day before (final readiness)' },
];

const priorityOptions: SelectOption[] = [
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
  const [title, setTitle] = useState('');
  const [horizon, setHorizon] = useState<TimelineHorizon>('1_month');
  const [category, setCategory] = useState('Production & Rigging');
  const [priority, setPriority] = useState<Priority>('high');
  const [assignee, setAssignee] = useState('Operations Lead');
  const [dueDate, setDueDate] = useState(defaultDate || '2026-11-20');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeInput(title);
    const cleanCategory = sanitizeInput(category);
    const cleanAssignee = sanitizeInput(assignee);
    if (!cleanTitle) return;

    onAddTask({
      id: `mt-user-${Date.now()}`,
      horizon,
      title: cleanTitle,
      category: cleanCategory || 'General Operations',
      priority,
      assignee: cleanAssignee || 'Unassigned',
      dueDate,
      completed: false,
    });

    setTitle('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add milestone task"
      description="Schedule an operational deadline across your planning horizon."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="task-title" className="block text-muted font-medium mb-1">
            Milestone title
          </label>
          <input
            id="task-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Conduct generator load test and sound licensing check"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">
              Planning horizon
            </label>
            <Select
              value={horizon}
              onChange={(val) => setHorizon(val as TimelineHorizon)}
              options={horizonOptions}
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">
              Priority level
            </label>
            <Select
              value={priority}
              onChange={(val) => setPriority(val as Priority)}
              options={priorityOptions}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-cat" className="block text-muted font-medium mb-1">
              Category
            </label>
            <input
              id="task-cat"
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Permits & Safety, Decor, AV Photo"
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="task-assignee" className="block text-muted font-medium mb-1">
              Assignee
            </label>
            <input
              id="task-assignee"
              type="text"
              required
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="e.g. Lead Coordinator, Banquet Captain"
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="task-due" className="block text-muted font-medium mb-1">
            Target due date
          </label>
          <input
            id="task-due"
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
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

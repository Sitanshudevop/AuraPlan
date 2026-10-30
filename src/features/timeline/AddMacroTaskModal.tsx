import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { MacroTask, TimelineHorizon, Priority } from '../../types/timeline';
import { sanitizeInput } from '../../utils/sanitizer';

interface AddMacroTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: MacroTask) => void;
  defaultDate: string;
}

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
      title="Add Milestone Task"
      description="Schedule an operational deadline across your multi-month planning horizon."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="task-title" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
            Milestone Title
          </label>
          <input
            id="task-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Conduct generator load test and sound licensing check"
            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-horizon" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Planning Horizon
            </label>
            <select
              id="task-horizon"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as TimelineHorizon)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            >
              <option value="6_months">6+ Months Out (Architectural)</option>
              <option value="3_months">3 Months Out (Design & Sourcing)</option>
              <option value="1_month">1 Month Out (Operational Refinement)</option>
              <option value="1_week">1 Week Out (Production Locks)</option>
              <option value="day_before">Day Before (Final Readiness)</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-priority" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Priority Level
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            >
              <option value="critical">Critical (Blocker)</option>
              <option value="high">High Priority</option>
              <option value="normal">Standard Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-cat" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Category
            </label>
            <input
              id="task-cat"
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Permits & Safety, Decor, AV Photo"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="task-assignee" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Assignee / Point of Contact
            </label>
            <input
              id="task-assignee"
              type="text"
              required
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="e.g. Lead Coordinator, Banquet Captain"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="task-due" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
            Target Due Date
          </label>
          <input
            id="task-due"
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Add Milestone
          </Button>
        </div>
      </form>
    </Modal>
  );
};

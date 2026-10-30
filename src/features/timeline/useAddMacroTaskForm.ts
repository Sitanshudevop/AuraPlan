import { useState } from 'react';
import { MacroTask, TimelineHorizon, Priority } from '../../types/timeline';
import { sanitizeInput } from '../../utils/security';

interface UseAddMacroTaskFormProps {
  defaultDate: string;
  onAddTask: (task: MacroTask) => void;
  onClose: () => void;
}

export function useAddMacroTaskForm({
  defaultDate,
  onAddTask,
  onClose,
}: UseAddMacroTaskFormProps) {
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

  return {
    title,
    setTitle,
    horizon,
    setHorizon,
    category,
    setCategory,
    priority,
    setPriority,
    assignee,
    setAssignee,
    dueDate,
    setDueDate,
    handleSubmit,
  };
}


import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AddMacroTaskModal } from '../features/timeline/AddMacroTaskModal';
import { AddActivityModal } from '../features/timeline/AddActivityModal';
import { RunOfShowTableRow } from '../features/timeline/RunOfShowTableRow';
import { MacroTaskItem } from '../features/timeline/MacroTaskItem';
import { DayOfActivity, MacroTask } from '../types/timeline';

describe('Timeline Modals, Run-of-Show and Task Interactions', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  const mockActivity: DayOfActivity = {
    id: 'act-101',
    title: 'Grand Entrance & Varmala',
    startTime: '18:30',
    endTime: '19:15',
    durationMinutes: 45,
    locationZone: 'Main Lawn Stage',
    poc: 'Lead Coordinator',
    notes: 'Rose petal cannon timing',
  };

  const mockTask: MacroTask = {
    id: 'task-101',
    title: 'Lock Acoustic DJ Setup',
    horizon: '1_month',
    category: 'Production',
    priority: 'high',
    assignee: 'Entertainment Lead',
    dueDate: '2026-11-20',
    completed: false,
  };

  it('AddMacroTaskModal renders form, accepts inputs, and calls onAddTask on submit', () => {
    const handleAddTask = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddMacroTaskModal
        isOpen={true}
        onClose={handleClose}
        onAddTask={handleAddTask}
        defaultDate="2026-12-01"
      />
    );

    expect(screen.getByText('Add milestone task')).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Milestone title/i);
    fireEvent.change(titleInput, { target: { value: 'Confirm Audio Rigging' } });

    const submitBtn = screen.getByRole('button', { name: /Add milestone/i });
    fireEvent.click(submitBtn);

    expect(handleAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirm Audio Rigging',
      })
    );
  });

  it('AddActivityModal renders form, accepts inputs, and calls onAddActivity on submit', () => {
    const handleAddActivity = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddActivityModal
        isOpen={true}
        onClose={handleClose}
        onAddActivity={handleAddActivity}
      />
    );

    expect(screen.getByText('Add Day-Of Run-of-Show Activity')).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Activity \/ Ritual Title/i);
    fireEvent.change(titleInput, { target: { value: 'Welcome Drinks Reception' } });

    const submitBtn = screen.getByRole('button', { name: /Add to Run-of-Show/i });
    fireEvent.click(submitBtn);

    expect(handleAddActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Welcome Drinks Reception',
      })
    );
  });

  it('RunOfShowTableRow renders activity details and handles shift/delete actions', () => {
    const handleShift = vi.fn();
    const handleDelete = vi.fn();

    const { rerender } = render(
      <table>
        <tbody>
          <RunOfShowTableRow
            activity={mockActivity}
            hasConflict={true}
            onShiftActivity={handleShift}
            onDeleteActivity={handleDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Grand Entrance & Varmala')).toBeInTheDocument();
    expect(screen.getByText('Main Lawn Stage')).toBeInTheDocument();

    // Shift button visible when hasConflict is true
    const shiftBtn = screen.getByRole('button', { name: /Shift \+30m/i });
    fireEvent.click(shiftBtn);
    expect(handleShift).toHaveBeenCalledWith('act-101');

    // Delete button
    const deleteBtn = screen.getByRole('button', { name: /Delete activity Grand Entrance/i });
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith('act-101');

    // Rerender with no conflict
    rerender(
      <table>
        <tbody>
          <RunOfShowTableRow
            activity={mockActivity}
            hasConflict={false}
            onShiftActivity={handleShift}
            onDeleteActivity={handleDelete}
          />
        </tbody>
      </table>
    );
    expect(screen.queryByRole('button', { name: /Shift \+30m/i })).not.toBeInTheDocument();
  });

  it('MacroTaskItem toggles task completion and deletes task', () => {
    const handleToggle = vi.fn();
    const handleDelete = vi.fn();

    const { rerender } = render(
      <MacroTaskItem
        task={mockTask}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText('Lock Acoustic DJ Setup')).toBeInTheDocument();

    // Toggle complete
    const toggleBtn = screen.getByRole('button', { name: /Mark "Lock Acoustic DJ Setup" complete/i });
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledWith('task-101', false);

    // Delete
    const deleteBtn = screen.getByRole('button', { name: /Delete task Lock Acoustic DJ Setup/i });
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith('task-101');

    // Rerender as completed
    rerender(
      <MacroTaskItem
        task={{ ...mockTask, completed: true, priority: 'critical' }}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    );
    expect(screen.getByRole('button', { name: /Mark "Lock Acoustic DJ Setup" incomplete/i })).toBeInTheDocument();
  });
});

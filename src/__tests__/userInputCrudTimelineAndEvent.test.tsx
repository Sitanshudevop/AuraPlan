import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';
import { TimelineTab } from '../features/timeline/TimelineTab';
import { EditEventModal } from '../components/modals/EditEventModal';

const TimelineTestHarness: React.FC = () => {
  const { state, deleteMacroTask, deleteDayOfActivity } = useWorkspace();

  return (
    <div>
      <div data-testid="task-count">{state.macroTasks.length}</div>
      <div data-testid="activity-count">{state.dayOfActivities.length}</div>
      <div data-testid="event-title">{state.event.name}</div>
      <button onClick={() => deleteMacroTask(state.macroTasks[0]?.id || '')}>
        Trigger Delete First Task
      </button>
      <button onClick={() => deleteDayOfActivity(state.dayOfActivities[0]?.id || '')}>
        Trigger Delete First Activity
      </button>
    </div>
  );
};

describe('User Input CRUD: Timeline Tasks, Activities & Event Parameters', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
  });

  it('allows deleting macro countdown tasks and day-of activities', () => {
    render(
      <WorkspaceProvider>
        <TimelineTestHarness />
      </WorkspaceProvider>
    );

    const initialTaskCount = Number(screen.getByTestId('task-count').textContent);
    const initialActivityCount = Number(screen.getByTestId('activity-count').textContent);

    fireEvent.click(screen.getByText('Trigger Delete First Task'));
    expect(Number(screen.getByTestId('task-count').textContent)).toBe(initialTaskCount - 1);

    fireEvent.click(screen.getByText('Trigger Delete First Activity'));
    expect(Number(screen.getByTestId('activity-count').textContent)).toBe(initialActivityCount - 1);
  });

  it('renders Add Milestone and Add Activity buttons in TimelineTab', () => {
    render(
      <WorkspaceProvider>
        <TimelineTab />
      </WorkspaceProvider>
    );

    const addMilestoneBtn = screen.getByRole('button', { name: /Add Milestone/i });
    expect(addMilestoneBtn).toBeInTheDocument();
    fireEvent.click(addMilestoneBtn);
    expect(screen.getByText(/Add Milestone Task/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    fireEvent.click(screen.getByRole('button', { name: /Day-Of Run-of-Show/i }));
    const addActivityBtn = screen.getByRole('button', { name: /Add Activity/i });
    expect(addActivityBtn).toBeInTheDocument();
    fireEvent.click(addActivityBtn);
    expect(screen.getByText(/Add Day-Of Run-of-Show Activity/i)).toBeInTheDocument();
  });

  it('allows updating event parameters via EditEventModal', () => {
    const TestEditWrapper = () => {
      const { setEditEventModalOpen } = useWorkspace();
      return (
        <div>
          <button onClick={() => setEditEventModalOpen(true)}>Open Edit</button>
          <TimelineTestHarness />
          <EditEventModal />
        </div>
      );
    };

    render(
      <WorkspaceProvider>
        <TestEditWrapper />
      </WorkspaceProvider>
    );

    fireEvent.click(screen.getByText('Open Edit'));
    expect(screen.getByText(/Edit Event Parameters/i)).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Event Name/i);
    fireEvent.change(titleInput, { target: { value: 'Jaipur Sunset Gala Celebration' } });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    });

    expect(screen.getByTestId('event-title').textContent).toBe('Jaipur Sunset Gala Celebration');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';
import { BudgetTab } from '../features/budget/BudgetTab';
import { TimelineTab } from '../features/timeline/TimelineTab';
import { VendorsTab } from '../features/vendors/VendorsTab';
import { EditEventModal } from '../components/modals/EditEventModal';

const TestHarness: React.FC = () => {
  const {
    state,
    addBudgetItem,
    deleteBudgetItem,
    deleteVendor,
    deleteMacroTask,
    deleteDayOfActivity,
  } = useWorkspace();

  return (
    <div>
      <div data-testid="budget-count">{state.budgetItems.length}</div>
      <div data-testid="task-count">{state.macroTasks.length}</div>
      <div data-testid="activity-count">{state.dayOfActivities.length}</div>
      <div data-testid="vendor-count">{state.vendors.length}</div>
      <div data-testid="event-title">{state.event.name}</div>
      <button
        onClick={() =>
          addBudgetItem({
            id: 'item-custom-test',
            name: 'Artisan Glassware',
            category: 'decor',
            allocated: 45000,
            vendorQuote: 42000,
            actualContracted: 40000,
            amountPaid: 10000,
            isLocked: false,
          })
        }
      >
        Trigger Add Budget
      </button>
      <button onClick={() => deleteBudgetItem(state.budgetItems[0]?.id || '')}>
        Trigger Delete First Budget
      </button>
      <button onClick={() => deleteVendor(state.vendors[0]?.id || '')}>
        Trigger Delete First Vendor
      </button>
      <button onClick={() => deleteMacroTask(state.macroTasks[0]?.id || '')}>
        Trigger Delete First Task
      </button>
      <button onClick={() => deleteDayOfActivity(state.dayOfActivities[0]?.id || '')}>
        Trigger Delete First Activity
      </button>
    </div>
  );
};

describe('User Input Capabilities & CRUD Operations', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
  });

  it('allows adding and deleting custom budget items with state synchronization', () => {
    render(
      <WorkspaceProvider>
        <TestHarness />
      </WorkspaceProvider>
    );

    const initialCount = Number(screen.getByTestId('budget-count').textContent);
    expect(initialCount).toBeGreaterThan(0);

    // Add budget item
    fireEvent.click(screen.getByText('Trigger Add Budget'));
    expect(Number(screen.getByTestId('budget-count').textContent)).toBe(initialCount + 1);

    // Delete first budget item
    fireEvent.click(screen.getByText('Trigger Delete First Budget'));
    expect(Number(screen.getByTestId('budget-count').textContent)).toBe(initialCount);
  });

  it('allows deleting macro countdown tasks and day-of activities', () => {
    render(
      <WorkspaceProvider>
        <TestHarness />
      </WorkspaceProvider>
    );

    const initialTaskCount = Number(screen.getByTestId('task-count').textContent);
    const initialActivityCount = Number(screen.getByTestId('activity-count').textContent);

    fireEvent.click(screen.getByText('Trigger Delete First Task'));
    expect(Number(screen.getByTestId('task-count').textContent)).toBe(initialTaskCount - 1);

    fireEvent.click(screen.getByText('Trigger Delete First Activity'));
    expect(Number(screen.getByTestId('activity-count').textContent)).toBe(initialActivityCount - 1);
  });

  it('allows deleting vendors from CRM', () => {
    render(
      <WorkspaceProvider>
        <TestHarness />
      </WorkspaceProvider>
    );

    const initialVendorCount = Number(screen.getByTestId('vendor-count').textContent);
    fireEvent.click(screen.getByText('Trigger Delete First Vendor'));
    expect(Number(screen.getByTestId('vendor-count').textContent)).toBe(initialVendorCount - 1);
  });

  it('renders Add Line Item button in BudgetTab and opens modal', () => {
    render(
      <WorkspaceProvider>
        <BudgetTab />
      </WorkspaceProvider>
    );

    const addBtn = screen.getByRole('button', { name: /Add Line Item/i });
    expect(addBtn).toBeInTheDocument();

    fireEvent.click(addBtn);
    expect(screen.getByText(/Add Budget Line Item/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Item Name \/ Scope/i)).toBeInTheDocument();

    // Fill form and submit
    fireEvent.change(screen.getByLabelText(/Item Name \/ Scope/i), { target: { value: 'Custom Acoustic Band' } });
    fireEvent.change(screen.getByLabelText(/Target Allocation/i), { target: { value: '85000' } });

    const submitBtn = screen.getByRole('button', { name: /Add to Budget/i });
    fireEvent.click(submitBtn);

    // Modal should close
    expect(screen.queryByText(/Add Budget Line Item/i)).not.toBeInTheDocument();
  });

  it('renders Add Milestone and Add Activity buttons in TimelineTab', () => {
    render(
      <WorkspaceProvider>
        <TimelineTab />
      </WorkspaceProvider>
    );

    // Macro view
    const addMilestoneBtn = screen.getByRole('button', { name: /Add Milestone/i });
    expect(addMilestoneBtn).toBeInTheDocument();
    fireEvent.click(addMilestoneBtn);
    expect(screen.getByText(/Add Milestone Task/i)).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // Switch to Day-Of Run-of-Show
    fireEvent.click(screen.getByRole('button', { name: /Day-Of Run-of-Show/i }));
    const addActivityBtn = screen.getByRole('button', { name: /Add Activity/i });
    expect(addActivityBtn).toBeInTheDocument();
    fireEvent.click(addActivityBtn);
    expect(screen.getByText(/Add Day-Of Run-of-Show Activity/i)).toBeInTheDocument();
  });

  it('renders Add Vendor button in VendorsTab and opens modal', () => {
    render(
      <WorkspaceProvider>
        <VendorsTab />
      </WorkspaceProvider>
    );

    const addVendorBtn = screen.getByRole('button', { name: /Add Vendor/i });
    expect(addVendorBtn).toBeInTheDocument();
    fireEvent.click(addVendorBtn);
    expect(screen.getByText(/Add Vendor Partner/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company \/ Vendor Name/i)).toBeInTheDocument();
  });

  it('allows updating event parameters via EditEventModal', () => {
    const TestEditWrapper = () => {
      const { setEditEventModalOpen } = useWorkspace();
      return (
        <div>
          <button onClick={() => setEditEventModalOpen(true)}>Open Edit</button>
          <TestHarness />
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

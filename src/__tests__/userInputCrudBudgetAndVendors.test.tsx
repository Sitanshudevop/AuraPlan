import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';
import { BudgetTab } from '../features/budget/BudgetTab';
import { VendorsTab } from '../features/vendors/VendorsTab';

const BudgetAndVendorTestHarness: React.FC = () => {
  const { state, addBudgetItem, deleteBudgetItem, deleteVendor } = useWorkspace();

  return (
    <div>
      <div data-testid="budget-count">{state.budgetItems.length}</div>
      <div data-testid="vendor-count">{state.vendors.length}</div>
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
    </div>
  );
};

describe('User Input CRUD: Budget & Vendor Operations', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
  });

  it('allows adding and deleting custom budget items with state synchronization', () => {
    render(
      <WorkspaceProvider>
        <BudgetAndVendorTestHarness />
      </WorkspaceProvider>
    );

    const initialCount = Number(screen.getByTestId('budget-count').textContent);
    expect(initialCount).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Trigger Add Budget'));
    expect(Number(screen.getByTestId('budget-count').textContent)).toBe(initialCount + 1);

    fireEvent.click(screen.getByText('Trigger Delete First Budget'));
    expect(Number(screen.getByTestId('budget-count').textContent)).toBe(initialCount);
  });

  it('allows deleting vendors from CRM', () => {
    render(
      <WorkspaceProvider>
        <BudgetAndVendorTestHarness />
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

    fireEvent.change(screen.getByLabelText(/Item Name \/ Scope/i), { target: { value: 'Custom Acoustic Band' } });
    fireEvent.change(screen.getByLabelText(/Target Allocation/i), { target: { value: '85000' } });

    const submitBtn = screen.getByRole('button', { name: /Add to Budget/i });
    fireEvent.click(submitBtn);

    expect(screen.queryByText(/Add Budget Line Item/i)).not.toBeInTheDocument();
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
});


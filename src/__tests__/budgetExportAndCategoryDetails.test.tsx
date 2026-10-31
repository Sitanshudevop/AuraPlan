import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BudgetExportMenu } from '../features/budget/BudgetExportMenu';
import { CategoryRowDetails } from '../features/budget/CategoryRowDetails';
import { BudgetItem } from '../types/budget';

describe('BudgetExportMenu and CategoryRowDetails Interactions', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  const mockItem: BudgetItem = {
    id: 'b-1',
    category: 'catering',
    name: 'Royal Banquet',
    allocated: 100000,
    vendorQuote: 110000,
    actualContracted: 105000,
    amountPaid: 50000,
    isLocked: true,
  };

  it('toggles BudgetExportMenu and triggers CSV download and print worksheet', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(<BudgetExportMenu budgetItems={[mockItem]} eventName="Royal Gala" />);

    const menuBtn = screen.getByRole('button', { name: /More budget actions/i });
    fireEvent.click(menuBtn);

    const downloadBtn = screen.getByRole('button', { name: /Download CSV/i });
    expect(downloadBtn).toBeInTheDocument();
    fireEvent.click(downloadBtn);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();

    // Reopen and print
    fireEvent.click(menuBtn);
    const printBtn = screen.getByRole('button', { name: /Print worksheet/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('renders CategoryRowDetails with positive and negative variance indicators', () => {
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn();

    const { rerender } = render(
      <table>
        <tbody>
          <CategoryRowDetails
            item={mockItem}
            currency="INR"
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText(/Locked from auto-rebalance/i)).toBeInTheDocument();
    expect(screen.getByText(/\+₹5,000/i)).toBeInTheDocument();

    // Change contracted
    const contractedInput = screen.getByDisplayValue('105000');
    fireEvent.change(contractedInput, { target: { value: '115000' } });
    expect(handleUpdate).toHaveBeenCalledWith({ actualContracted: 115000 });

    // Change paid
    const paidInput = screen.getByDisplayValue('50000');
    fireEvent.change(paidInput, { target: { value: '60000' } });
    expect(handleUpdate).toHaveBeenCalledWith({ amountPaid: 60000 });

    // Delete item
    const deleteBtn = screen.getByRole('button', { name: /Delete Royal Banquet from budget/i });
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalled();

    // Rerender with unlocked item and negative variance (savings)
    const unlockedItem: BudgetItem = {
      ...mockItem,
      actualContracted: 90000,
      isLocked: false,
    };

    rerender(
      <table>
        <tbody>
          <CategoryRowDetails
            item={unlockedItem}
            currency="INR"
            onUpdate={handleUpdate}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText(/Eligible for auto-allocation/i)).toBeInTheDocument();
  });
});

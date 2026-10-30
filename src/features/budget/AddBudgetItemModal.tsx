import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { SelectOption } from '../../components/ui/Select';
import { BudgetItem } from '../../types/budget';
import { Currency } from '../../types/event';
import { useAddBudgetItemForm } from './useAddBudgetItemForm';
import { BudgetItemFinancialFields } from './BudgetItemFinancialFields';

interface AddBudgetItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBudgetItem: (item: BudgetItem) => void;
  currency: Currency;
  remainingBudget?: number;
}

export const BUDGET_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'venue', label: 'Venue & grounds' },
  { value: 'catering', label: 'Catering & bar' },
  { value: 'decor', label: 'Decor & florals' },
  { value: 'av_photo', label: 'Photography & AV' },
  { value: 'entertainment', label: 'Entertainment & music' },
  { value: 'logistics', label: 'Logistics & shuttles' },
  { value: 'buffer', label: 'Emergency contingency' },
];

export const AddBudgetItemModal: React.FC<AddBudgetItemModalProps> = ({
  isOpen,
  onClose,
  onAddBudgetItem,
  currency,
  remainingBudget = 50000,
}) => {
  const form = useAddBudgetItemForm({
    remainingBudget,
    onAddBudgetItem,
    onClose,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add budget line item"
      description="Create a custom cost allocation for decor, vendors, permits, or contingencies."
      maxWidth="md"
    >
      <form onSubmit={form.handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="budget-name" className="block text-muted font-medium mb-1">
            Item name / scope
          </label>
          <input
            id="budget-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => form.setName(e.target.value)}
            placeholder="e.g. Cold pyrotechnics rig & entry foggers"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
          />
        </div>

        <BudgetItemFinancialFields
          category={form.category}
          onCategoryChange={form.setCategory}
          categoryOptions={BUDGET_CATEGORY_OPTIONS}
          allocated={form.allocated}
          onAllocatedChange={form.setAllocated}
          vendorQuote={form.vendorQuote}
          onVendorQuoteChange={form.setVendorQuote}
          actualContracted={form.actualContracted}
          onActualContractedChange={form.setActualContracted}
          amountPaid={form.amountPaid}
          onAmountPaidChange={form.setAmountPaid}
          currency={currency}
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            id="budget-locked"
            type="checkbox"
            checked={form.isLocked}
            onChange={(e) => form.setIsLocked(e.target.checked)}
            className="rounded border-hairline bg-surface-raised text-accent focus:ring-accent"
          />
          <label htmlFor="budget-locked" className="text-muted text-xs select-none">
            Lock from auto-balancing algorithms
          </label>
        </div>

        <div>
          <label htmlFor="budget-notes" className="block text-muted font-medium mb-1">
            Notes / deliverables
          </label>
          <input
            id="budget-notes"
            type="text"
            value={form.notes}
            onChange={(e) => form.setNotes(e.target.value)}
            placeholder="e.g. 4 stage flame units with cold spark duration 30s"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-hairline">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Add to Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
};

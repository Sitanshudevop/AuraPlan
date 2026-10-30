import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select, SelectOption } from '../../components/ui/Select';
import { BudgetItem, BudgetCategory } from '../../types/budget';
import { Currency } from '../../types/event';
import { sanitizeInput } from '../../utils/security';

interface AddBudgetItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBudgetItem: (item: BudgetItem) => void;
  currency: Currency;
  remainingBudget?: number;
}

const categoryOptions: SelectOption[] = [
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
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('decor');
  const [allocated, setAllocated] = useState<number>(Math.max(1000, Math.min(25000, remainingBudget)));
  const [vendorQuote, setVendorQuote] = useState<number>(0);
  const [actualContracted, setActualContracted] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isLocked, setIsLocked] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name);
    const cleanNotes = sanitizeInput(notes);
    if (!cleanName) return;

    onAddBudgetItem({
      id: `b-user-${Date.now()}`,
      category,
      name: cleanName,
      allocated: Number(allocated),
      vendorQuote: Number(vendorQuote) || Number(allocated),
      actualContracted: Number(actualContracted) || 0,
      amountPaid: Number(amountPaid) || 0,
      isLocked,
      notes: cleanNotes || undefined,
    });

    setName('');
    setNotes('');
    setVendorQuote(0);
    setActualContracted(0);
    setAmountPaid(0);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add budget line item"
      description="Create a custom cost allocation for decor, vendors, permits, or contingencies."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="budget-name" className="block text-muted font-medium mb-1">
            Item name / scope
          </label>
          <input
            id="budget-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cold pyrotechnics rig & entry foggers"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">
              Budget category
            </label>
            <Select
              value={category}
              onChange={(val) => setCategory(val as BudgetCategory)}
              options={categoryOptions}
            />
          </div>

          <div>
            <label htmlFor="budget-alloc" className="block text-muted font-medium mb-1">
              Target allocation ({currency})
            </label>
            <input
              id="budget-alloc"
              type="number"
              min="0"
              step="500"
              required
              value={allocated}
              onChange={(e) => setAllocated(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="budget-quote" className="block text-muted font-medium mb-1">
              Vendor quote
            </label>
            <input
              id="budget-quote"
              type="number"
              min="0"
              step="500"
              value={vendorQuote}
              onChange={(e) => setVendorQuote(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="budget-actual" className="block text-muted font-medium mb-1">
              Contracted cost
            </label>
            <input
              id="budget-actual"
              type="number"
              min="0"
              step="500"
              value={actualContracted}
              onChange={(e) => setActualContracted(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="budget-paid" className="block text-muted font-medium mb-1">
              Amount paid
            </label>
            <input
              id="budget-paid"
              type="number"
              min="0"
              step="500"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="budget-locked"
            type="checkbox"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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

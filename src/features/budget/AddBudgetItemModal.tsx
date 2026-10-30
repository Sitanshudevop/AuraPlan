import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { BudgetItem, BudgetCategory } from '../../types/budget';
import { Currency } from '../../types/event';
import { sanitizeInput } from '../../utils/sanitizer';

interface AddBudgetItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBudgetItem: (item: BudgetItem) => void;
  currency: Currency;
  remainingBudget: number;
}

export const AddBudgetItemModal: React.FC<AddBudgetItemModalProps> = ({
  isOpen,
  onClose,
  onAddBudgetItem,
  currency,
  remainingBudget,
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
      title="Add Budget Line Item"
      description="Create a custom cost allocation for decor, vendors, permits, or contingencies."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="budget-name" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
            Item Name / Scope
          </label>
          <input
            id="budget-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cold Pyrotechnics Rig & Entry Foggers"
            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="budget-cat" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Budget Category
            </label>
            <select
              id="budget-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as BudgetCategory)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            >
              <option value="venue">Venue & Grounds</option>
              <option value="catering">Catering & Bar</option>
              <option value="decor">Decor & Florals</option>
              <option value="av_photo">Photography & AV</option>
              <option value="entertainment">Entertainment & Music</option>
              <option value="logistics">Logistics & Shuttles</option>
              <option value="buffer">Emergency Contingency</option>
            </select>
          </div>

          <div>
            <label htmlFor="budget-alloc" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Target Allocation ({currency === 'INR' ? '₹' : '$'})
            </label>
            <input
              id="budget-alloc"
              type="number"
              min="0"
              step="500"
              required
              value={allocated}
              onChange={(e) => setAllocated(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md font-mono dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="budget-quote" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Vendor Quote
            </label>
            <input
              id="budget-quote"
              type="number"
              min="0"
              step="500"
              value={vendorQuote}
              onChange={(e) => setVendorQuote(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md font-mono dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="budget-actual" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Contracted Cost
            </label>
            <input
              id="budget-actual"
              type="number"
              min="0"
              step="500"
              value={actualContracted}
              onChange={(e) => setActualContracted(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md font-mono dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="budget-paid" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Amount Paid
            </label>
            <input
              id="budget-paid"
              type="number"
              min="0"
              step="500"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md font-mono dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="budget-locked"
            type="checkbox"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
            className="rounded border-stone-300 dark:border-zinc-700 text-stone-900 focus:ring-stone-400"
          />
          <label htmlFor="budget-locked" className="text-stone-700 dark:text-zinc-300 select-none">
            Lock from auto-balancing algorithms
          </label>
        </div>

        <div>
          <label htmlFor="budget-notes" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
            Notes / Deliverables Specification
          </label>
          <input
            id="budget-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. 4 stage flame units with cold spark duration 30s"
            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-zinc-800">
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

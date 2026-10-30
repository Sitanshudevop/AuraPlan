import React from 'react';
import { Currency } from '../../types/event';
import { Select, SelectOption } from '../../components/ui/Select';
import { BudgetCategory } from '../../types/budget';

interface BudgetItemFinancialFieldsProps {
  category: BudgetCategory;
  onCategoryChange: (cat: BudgetCategory) => void;
  categoryOptions: SelectOption[];
  allocated: number;
  onAllocatedChange: (val: number) => void;
  vendorQuote: number;
  onVendorQuoteChange: (val: number) => void;
  actualContracted: number;
  onActualContractedChange: (val: number) => void;
  amountPaid: number;
  onAmountPaidChange: (val: number) => void;
  currency: Currency;
}

export const BudgetItemFinancialFields: React.FC<BudgetItemFinancialFieldsProps> = ({
  category,
  onCategoryChange,
  categoryOptions,
  allocated,
  onAllocatedChange,
  vendorQuote,
  onVendorQuoteChange,
  actualContracted,
  onActualContractedChange,
  amountPaid,
  onAmountPaidChange,
  currency,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-muted font-medium mb-1">Budget category</label>
          <Select
            value={category}
            onChange={(val) => onCategoryChange(val as BudgetCategory)}
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
            onChange={(e) => onAllocatedChange(Number(e.target.value))}
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
            onChange={(e) => onVendorQuoteChange(Number(e.target.value))}
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
            onChange={(e) => onActualContractedChange(Number(e.target.value))}
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
            onChange={(e) => onAmountPaidChange(Number(e.target.value))}
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>
    </>
  );
};

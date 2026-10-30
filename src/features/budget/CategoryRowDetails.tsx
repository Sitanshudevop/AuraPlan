import React from 'react';
import { BudgetItem } from '../../types/budget';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Trash2 } from 'lucide-react';

interface CategoryRowDetailsProps {
  item: BudgetItem;
  currency: Currency;
  onUpdate: (partial: Partial<BudgetItem>) => void;
  onDelete?: () => void;
}

export const CategoryRowDetails: React.FC<CategoryRowDetailsProps> = ({
  item,
  currency,
  onUpdate,
  onDelete,
}) => {
  const variance = item.actualContracted - item.allocated;

  return (
    <tr className="bg-stone-50/40 dark:bg-white/[0.01] border-b border-stone-200/80 dark:border-white/[0.08] text-xs">
      <td colSpan={4} className="py-4 px-6 sm:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-3">
          <div className="space-y-1">
            <span className="text-xs text-stone-400 dark:text-zinc-500">Initial quote</span>
            <div className="font-medium tabular-nums text-stone-700 dark:text-[#EDEDEF]">
              {formatCurrency(item.vendorQuote, currency)}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-stone-400 dark:text-zinc-500">Variance vs target</span>
            <div
              className={`font-medium tabular-nums ${
                variance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {variance > 0 ? '+' : ''}
              {formatCurrency(variance, currency)}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-stone-400 dark:text-zinc-500">Rebalance protection</span>
            <div className="text-stone-600 dark:text-[#8B8B93]">
              {item.isLocked ? 'Locked from auto-rebalance' : 'Eligible for auto-allocation'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200/60 dark:border-white/[0.04]">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-[#8B8B93]">
              <span>Contracted:</span>
              <input
                type="number"
                min="0"
                step="500"
                value={item.actualContracted}
                onChange={(e) => onUpdate({ actualContracted: Number(e.target.value) })}
                className="w-24 px-2 py-1 bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-white/[0.08] rounded-md tabular-nums text-xs"
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-[#8B8B93]">
              <span>Paid:</span>
              <input
                type="number"
                min="0"
                step="500"
                value={item.amountPaid}
                onChange={(e) => onUpdate({ amountPaid: Number(e.target.value) })}
                className="w-24 px-2 py-1 bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-white/[0.08] rounded-md tabular-nums text-xs"
              />
            </label>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              aria-label={`Delete ${item.name} from budget`}
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Remove line item</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

import React from 'react';
import { BudgetItem, BudgetCategory } from '../../types/budget';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';

interface CategoryRowProps {
  item: BudgetItem;
  totalBudget: number;
  currency: Currency;
  onUpdate: (partial: Partial<BudgetItem>) => void;
}

const categoryLabels: Record<BudgetCategory, string> = {
  venue: 'Venue & Grounds',
  catering: 'Catering & Bar',
  decor: 'Decor & Florals',
  av_photo: 'Photography & AV',
  entertainment: 'Entertainment & Music',
  logistics: 'Logistics & Shuttles',
  buffer: 'Emergency Contingency',
};

export const CategoryRow: React.FC<CategoryRowProps> = ({
  item,
  totalBudget,
  currency,
  onUpdate,
}) => {
  const isOverAllocated = item.actualContracted > item.allocated;
  const allocationPercent = totalBudget > 0 ? (item.allocated / totalBudget) * 100 : 0;

  return (
    <tr className="border-b border-stone-200 dark:border-zinc-800/80 hover:bg-stone-50/50 dark:hover:bg-zinc-900/30 text-xs">
      {/* Category Name & Lock */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate({ isLocked: !item.isLocked })}
            className={`p-1 rounded transition-colors ${
              item.isLocked
                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                : 'text-stone-400 hover:text-stone-600'
            }`}
            title={item.isLocked ? 'Locked from auto-rebalancing' : 'Click to lock allocation'}
            aria-label={item.isLocked ? 'Unlock category' : 'Lock category'}
          >
            {item.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <div>
            <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
              <span>{categoryLabels[item.category] || item.name}</span>
              {isOverAllocated && (
                <span title="Actual cost exceeds allocation">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 inline" />
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500 dark:text-zinc-400 truncate max-w-[200px]">
              {item.name}
            </div>
          </div>
        </div>
      </td>

      {/* Allocation Slider & Value */}
      <td className="py-3 px-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between font-mono tabular-nums">
            <span className="font-bold text-stone-900 dark:text-white">
              {formatCurrency(item.allocated, currency)}
            </span>
            <span className="text-[10px] text-stone-500 font-mono tabular-nums">
              {allocationPercent.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={totalBudget * 0.8}
            step="1000"
            disabled={item.isLocked}
            value={item.allocated}
            onChange={(e) => onUpdate({ allocated: Number(e.target.value) })}
            className="w-full h-1.5 bg-stone-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-white disabled:opacity-40"
          />
        </div>
      </td>

      {/* Vendor Estimated Quote */}
      <td className="py-3 px-3 font-mono font-medium text-stone-600 dark:text-zinc-300 tabular-nums">
        {formatCurrency(item.vendorQuote, currency)}
      </td>

      {/* Actual Contracted Cost */}
      <td className="py-3 px-3 font-mono font-bold tabular-nums">
        <span className={isOverAllocated ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-white'}>
          {formatCurrency(item.actualContracted, currency)}
        </span>
      </td>

      {/* Amount Paid to Date */}
      <td className="py-3 px-3 font-mono font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
        {formatCurrency(item.amountPaid, currency)}
      </td>
    </tr>
  );
};

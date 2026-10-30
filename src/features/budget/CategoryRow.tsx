import React, { useState } from 'react';
import { BudgetItem, BudgetCategory } from '../../types/budget';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Lock, Unlock, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

interface CategoryRowProps {
  item: BudgetItem;
  totalBudget: number;
  currency: Currency;
  onUpdate: (partial: Partial<BudgetItem>) => void;
  onDelete?: () => void;
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

const CategoryRowComponent: React.FC<CategoryRowProps> = ({
  item,
  totalBudget,
  currency,
  onUpdate,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isOverAllocated = item.actualContracted > item.allocated;
  const allocationPercent = totalBudget > 0 ? (item.allocated / totalBudget) * 100 : 0;
  const paidPercent = item.actualContracted > 0 ? Math.min(100, Math.round((item.amountPaid / item.actualContracted) * 100)) : 0;

  return (
    <>
      <tr className="h-14 border-b border-stone-200/80 dark:border-white/[0.08] hover:bg-stone-50/60 dark:hover:bg-white/[0.02] text-xs transition-colors">
        {/* Category & Item Identity */}
        <td className="py-3 px-4">
          <div className="flex items-start gap-2.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors mt-0.5 shrink-0"
              aria-expanded={isExpanded}
              aria-label={`Toggle details for ${item.name}`}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" /> : <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />}
            </button>

            <button
              onClick={() => onUpdate({ isLocked: !item.isLocked })}
              className={`p-1 rounded transition-colors mt-0.5 shrink-0 ${
                item.isLocked
                  ? 'text-[#6E79F5] hover:text-[#5D68E2]'
                  : 'text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
              title={item.isLocked ? 'Locked from auto-rebalancing' : 'Click to lock allocation'}
              aria-label={item.isLocked ? 'Unlock category' : 'Lock category'}
            >
              {item.isLocked ? <Lock className="w-3.5 h-3.5 stroke-[1.5]" /> : <Unlock className="w-3.5 h-3.5 stroke-[1.5]" />}
            </button>

            <div className="min-w-0">
              <div className="font-medium text-[#111113] dark:text-[#EDEDEF] flex items-center gap-1.5 leading-snug line-clamp-2">
                <span>{item.name}</span>
                {isOverAllocated && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Actual cost exceeds allocation" />
                )}
              </div>
              <div className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">
                {categoryLabels[item.category] || item.category}
              </div>
            </div>
          </div>
        </td>

        {/* Allocation Slider & Value */}
        <td className="py-3 px-4 w-72 min-w-[200px]">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs tabular-nums text-stone-700 dark:text-[#EDEDEF]">
              <span className="font-medium">{formatCurrency(item.allocated, currency)}</span>
              <span className="text-[11px] text-stone-400 dark:text-zinc-500">{allocationPercent.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max={totalBudget * 0.8}
              step="1000"
              disabled={item.isLocked}
              value={item.allocated}
              onChange={(e) => onUpdate({ allocated: Number(e.target.value) })}
              aria-label={`${item.name} allocation slider`}
              className="w-full h-1 bg-stone-200 dark:bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-[#6E79F5] disabled:opacity-40"
            />
          </div>
        </td>

        {/* Actual Contracted Cost */}
        <td className="py-3 px-4 text-right tabular-nums">
          <div className={`font-medium ${isOverAllocated ? 'text-red-600 dark:text-red-400' : 'text-[#111113] dark:text-[#EDEDEF]'}`}>
            {formatCurrency(item.actualContracted, currency)}
          </div>
          {item.vendorQuote > 0 && item.vendorQuote !== item.actualContracted && (
            <div className="text-[11px] text-stone-400 dark:text-zinc-500">
              Quote: {formatCurrency(item.vendorQuote, currency)}
            </div>
          )}
        </td>

        {/* Amount Paid */}
        <td className="py-3 px-4 text-right tabular-nums">
          <div className="font-medium text-[#111113] dark:text-[#EDEDEF]">
            {formatCurrency(item.amountPaid, currency)}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-zinc-500">
            {paidPercent}% settled
          </div>
        </td>
      </tr>

      {/* Expandable Quote & Contract Details */}
      {isExpanded && (
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
                <div className={`font-medium tabular-nums ${item.actualContracted - item.allocated > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {item.actualContracted - item.allocated > 0 ? '+' : ''}
                  {formatCurrency(item.actualContracted - item.allocated, currency)}
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
      )}
    </>
  );
};

const areCategoryRowPropsEqual = (prev: CategoryRowProps, next: CategoryRowProps): boolean => {
  return (
    prev.item.id === next.item.id &&
    prev.item.allocated === next.item.allocated &&
    prev.item.actualContracted === next.item.actualContracted &&
    prev.item.amountPaid === next.item.amountPaid &&
    prev.item.vendorQuote === next.item.vendorQuote &&
    prev.item.isLocked === next.item.isLocked &&
    prev.currency === next.currency &&
    prev.totalBudget === next.totalBudget
  );
};

export const CategoryRow = React.memo(CategoryRowComponent, areCategoryRowPropsEqual);

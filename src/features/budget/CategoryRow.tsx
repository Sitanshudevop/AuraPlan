import React, { useState } from 'react';
import { BudgetItem, BudgetCategory } from '../../types/budget';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Lock, Unlock, AlertTriangle, ChevronDown, ChevronRight, FileText, Trash2 } from 'lucide-react';

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
      <tr className="border-b border-stone-200 dark:border-zinc-800/80 hover:bg-stone-50/60 dark:hover:bg-zinc-900/40 text-xs transition-colors">
        {/* Category & Item Identity */}
        <td className="py-3 px-4">
          <div className="flex items-start gap-2.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors mt-0.5 shrink-0"
              aria-expanded={isExpanded}
              aria-label={`Toggle details for ${item.name}`}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onUpdate({ isLocked: !item.isLocked })}
              className={`p-1 rounded transition-colors mt-0.5 shrink-0 ${
                item.isLocked
                  ? 'text-amber-700 bg-amber-500/15 dark:text-amber-300 dark:bg-amber-500/20'
                  : 'text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
              title={item.isLocked ? 'Locked from auto-rebalancing' : 'Click to lock allocation'}
              aria-label={item.isLocked ? 'Unlock category' : 'Lock category'}
            >
              {item.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>

            <div className="min-w-0">
              <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5 leading-snug">
                <span>{item.name}</span>
                {isOverAllocated && (
                  <span title="Actual cost exceeds allocation">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 inline shrink-0" />
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-medium">
                {categoryLabels[item.category] || item.category}
              </div>
            </div>
          </div>
        </td>

        {/* Allocation Slider & Value (min 160px) */}
        <td className="py-3 px-4 w-72 min-w-[180px]">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono tabular-nums">
              <span className="font-semibold text-stone-900 dark:text-white text-xs">
                {formatCurrency(item.allocated, currency)}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 font-mono tabular-nums">
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
              aria-label={`${item.name} allocation slider`}
              className="w-full min-w-[160px] h-2 bg-stone-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:accent-amber-400 disabled:opacity-40"
            />
          </div>
        </td>

        {/* Actual Contracted Cost */}
        <td className="py-3 px-4 font-mono font-bold tabular-nums">
          <span className={isOverAllocated ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-white'}>
            {formatCurrency(item.actualContracted, currency)}
          </span>
          {item.vendorQuote > 0 && item.vendorQuote !== item.actualContracted && (
            <div className="text-[10px] text-stone-600 dark:text-zinc-400 font-mono font-normal">
              Est: {formatCurrency(item.vendorQuote, currency)}
            </div>
          )}
        </td>

        {/* Amount Paid to Date */}
        <td className="py-3 px-4 font-mono font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
          <div>{formatCurrency(item.amountPaid, currency)}</div>
          <div className="text-[10px] text-stone-600 dark:text-zinc-400 font-mono font-normal">
            {paidPercent}% settled
          </div>
        </td>
      </tr>

      {/* Expandable Quote & Contract Details */}
      {isExpanded && (
        <tr className="bg-stone-50/70 dark:bg-zinc-900/40 border-b border-stone-200 dark:border-zinc-800 text-xs">
          <td colSpan={4} className="py-3 px-6 sm:px-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-1">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-zinc-400">
                  Initial Vendor Quote
                </span>
                <div className="font-mono font-semibold text-stone-800 dark:text-zinc-200 tabular-nums">
                  {formatCurrency(item.vendorQuote, currency)}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-zinc-400">
                  Variance vs Target
                </span>
                <div className={`font-mono font-semibold tabular-nums ${item.actualContracted - item.allocated > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {item.actualContracted - item.allocated > 0 ? '+' : ''}
                  {formatCurrency(item.actualContracted - item.allocated, currency)}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-zinc-400">
                  Rebalance Protection
                </span>
                <div className="text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span>{item.isLocked ? 'Protected from 1-click rebalance' : 'Eligible for auto-allocation'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mt-2 border-t border-stone-200/80 dark:border-zinc-800">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-zinc-400">
                  <span>Contracted ({currency === 'INR' ? '₹' : '$'}):</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={item.actualContracted}
                    onChange={(e) => onUpdate({ actualContracted: Number(e.target.value) })}
                    className="w-24 px-2 py-0.5 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded font-mono text-xs dark:text-white"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-zinc-400">
                  <span>Paid ({currency === 'INR' ? '₹' : '$'}):</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={item.amountPaid}
                    onChange={(e) => onUpdate({ amountPaid: Number(e.target.value) })}
                    className="w-24 px-2 py-0.5 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded font-mono text-xs dark:text-white"
                  />
                </label>
              </div>

              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  aria-label={`Delete ${item.name} from budget`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Line Item</span>
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

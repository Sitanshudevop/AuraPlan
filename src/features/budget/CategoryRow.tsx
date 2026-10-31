import React, { useState } from 'react';
import { BudgetItem, BudgetCategory } from '../../types/budget';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Lock, Unlock, ChevronDown, ChevronRight } from 'lucide-react';
import { CategoryRowDetails } from './CategoryRowDetails';

interface CategoryRowProps {
  item: BudgetItem;
  totalBudget: number;
  currency: Currency;
  onUpdate: (partial: Partial<BudgetItem>) => void;
  onDelete?: () => void;
}

export const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  venue: 'Venue & Grounds',
  catering: 'Catering & Bar',
  decor: 'Decor & Florals',
  av_photo: 'Photography & AV',
  entertainment: 'Entertainment & Music',
  logistics: 'Logistics & Shuttles',
  buffer: 'Emergency Contingency',
};

interface CategoryLockButtonProps {
  isLocked: boolean;
  onToggle: () => void;
}

const CategoryLockButton: React.FC<CategoryLockButtonProps> = ({ isLocked, onToggle }) => (
  <button
    onClick={onToggle}
    className={`p-1 rounded transition-colors mt-0.5 shrink-0 ${
      isLocked
        ? 'text-[#6E79F5] hover:text-[#5D68E2]'
        : 'text-stone-500 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300'
    }`}
    title={isLocked ? 'Locked from auto-rebalancing' : 'Click to lock allocation'}
    aria-label={isLocked ? 'Unlock category' : 'Lock category'}
  >
    {isLocked ? <Lock className="w-3.5 h-3.5 stroke-[1.5]" /> : <Unlock className="w-3.5 h-3.5 stroke-[1.5]" />}
  </button>
);

interface ContractedCostCellProps {
  actualContracted: number;
  allocated: number;
  vendorQuote: number;
  currency: Currency;
}

const ContractedCostCell: React.FC<ContractedCostCellProps> = ({
  actualContracted,
  allocated,
  vendorQuote,
  currency,
}) => {
  const isOver = actualContracted > allocated;
  const hasDistinctQuote = vendorQuote > 0 && vendorQuote !== actualContracted;

  return (
    <td className="py-3 px-4 text-right tabular-nums">
      <div className={`font-medium ${isOver ? 'text-red-600 dark:text-red-400' : 'text-[#111113] dark:text-[#EDEDEF]'}`}>
        {formatCurrency(actualContracted, currency)}
      </div>
      {hasDistinctQuote && (
        <div className="text-[11px] text-stone-500 dark:text-zinc-500">
          Quote: {formatCurrency(vendorQuote, currency)}
        </div>
      )}
    </td>
  );
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
              className="p-1 rounded text-stone-500 hover:text-stone-700 dark:hover:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors mt-0.5 shrink-0"
              aria-expanded={isExpanded}
              aria-label={`Toggle details for ${item.name}`}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" /> : <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />}
            </button>

            <CategoryLockButton
              isLocked={item.isLocked}
              onToggle={() => onUpdate({ isLocked: !item.isLocked })}
            />

            <div className="min-w-0">
              <div className="font-medium text-[#111113] dark:text-[#EDEDEF] flex items-center gap-1.5 leading-snug line-clamp-2">
                <span>{item.name}</span>
                {isOverAllocated && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Actual cost exceeds allocation" />
                )}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-zinc-500 mt-0.5">
                {CATEGORY_LABELS[item.category] || item.category}
              </div>
            </div>
          </div>
        </td>

        {/* Allocation Slider & Value */}
        <td className="py-3 px-4 w-72 min-w-[200px]">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs tabular-nums text-stone-700 dark:text-[#EDEDEF]">
              <span className="font-medium">{formatCurrency(item.allocated, currency)}</span>
              <span className="text-[11px] text-stone-500 dark:text-zinc-500">{allocationPercent.toFixed(1)}%</span>
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
        <ContractedCostCell
          actualContracted={item.actualContracted}
          allocated={item.allocated}
          vendorQuote={item.vendorQuote}
          currency={currency}
        />

        {/* Amount Paid */}
        <td className="py-3 px-4 text-right tabular-nums">
          <div className="font-medium text-[#111113] dark:text-[#EDEDEF]">
            {formatCurrency(item.amountPaid, currency)}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-zinc-500">
            {paidPercent}% settled
          </div>
        </td>
      </tr>

      {isExpanded && (
        <CategoryRowDetails item={item} currency={currency} onUpdate={onUpdate} onDelete={onDelete} />
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

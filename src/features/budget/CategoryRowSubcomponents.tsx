import React from 'react';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Lock, Unlock } from 'lucide-react';

export interface CategoryLockButtonProps {
  isLocked: boolean;
  onToggle: () => void;
}

export const CategoryLockButton: React.FC<CategoryLockButtonProps> = ({ isLocked, onToggle }) => (
  <button
    onClick={onToggle}
    className={`p-1 rounded transition-colors mt-0.5 shrink-0 ${
      isLocked
        ? 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300'
        : 'text-stone-500 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300'
    }`}
    title={isLocked ? 'Locked from auto-rebalancing' : 'Click to lock allocation'}
    aria-label={isLocked ? 'Unlock category' : 'Lock category'}
  >
    {isLocked ? <Lock className="w-3.5 h-3.5 stroke-[1.5]" /> : <Unlock className="w-3.5 h-3.5 stroke-[1.5]" />}
  </button>
);

export interface ContractedCostCellProps {
  actualContracted: number;
  allocated: number;
  vendorQuote: number;
  currency: Currency;
}

export const ContractedCostCell: React.FC<ContractedCostCellProps> = ({
  actualContracted,
  allocated,
  vendorQuote,
  currency,
}) => {
  const isOver = actualContracted > allocated;
  const hasDistinctQuote = vendorQuote > 0 && vendorQuote !== actualContracted;

  return (
    <td className="py-3 px-4 text-right tabular-nums">
      <div
        className={`font-medium ${
          isOver
            ? 'text-red-600 dark:text-red-400 font-semibold'
            : 'text-[#111113] dark:text-[#EDEDEF]'
        }`}
      >
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


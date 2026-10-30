import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Currency } from '../../types/event';
import { BudgetTotals } from './useBudgetTotals';

interface BudgetTableFooterProps {
  totals: BudgetTotals;
  currency: Currency;
  includeTaxInTotals: boolean;
  taxRatePercent: number;
}

export const BudgetTableFooter: React.FC<BudgetTableFooterProps> = ({
  totals,
  currency,
  includeTaxInTotals,
  taxRatePercent,
}) => {
  return (
    <tfoot className="border-t border-stone-200/80 dark:border-white/[0.08] bg-stone-50/50 dark:bg-white/[0.02] text-xs tabular-nums text-stone-800 dark:text-[#EDEDEF] font-medium">
      <tr>
        <td className="py-3.5 px-4 font-semibold">Subtotal allocations</td>
        <td className="py-3.5 px-4">{formatCurrency(totals.allocated, currency)}</td>
        <td className="py-3.5 px-4 text-right font-semibold">{formatCurrency(totals.actual, currency)}</td>
        <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400">
          {formatCurrency(totals.paid, currency)}
        </td>
      </tr>
      {includeTaxInTotals && (
        <tr className="border-t border-stone-200/60 dark:divide-white/[0.04] text-xs text-stone-500 dark:text-[#8B8B93]">
          <td className="py-2.5 px-4">Statutory tax estimate ({taxRatePercent}%)</td>
          <td className="py-2.5 px-4">—</td>
          <td className="py-2.5 px-4 text-right">+{formatCurrency(totals.taxAmount, currency)}</td>
          <td className="py-2.5 px-4 text-right">—</td>
        </tr>
      )}
    </tfoot>
  );
};

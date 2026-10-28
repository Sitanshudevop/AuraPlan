import React from 'react';
import { Card } from '../../components/ui/Card';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Wallet, Receipt, CheckCircle, PiggyBank } from 'lucide-react';

interface BudgetSummaryStripProps {
  targetBudget: number;
  actualContracted: number;
  paidAmount: number;
  remainingBudget: number;
  isOverBudget: boolean;
  currency: Currency;
}

const BudgetSummaryStripComponent: React.FC<BudgetSummaryStripProps> = ({
  targetBudget,
  actualContracted,
  paidAmount,
  remainingBudget,
  isOverBudget,
  currency,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 space-y-1 rounded-2xl border-stone-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total Target</span>
          <Wallet className="w-4 h-4 text-stone-400" />
        </div>
        <div className="text-lg font-mono font-bold text-stone-900 dark:text-white tabular-nums">
          {formatCurrency(targetBudget, currency)}
        </div>
        <div className="text-[11px] text-stone-600 dark:text-zinc-400">Base event allocation</div>
      </Card>

      <Card className="p-4 space-y-1 rounded-2xl border-stone-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Contracted</span>
          <Receipt className="w-4 h-4 text-amber-500" />
        </div>
        <div className={`text-lg font-mono font-bold tabular-nums ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-white'}`}>
          {formatCurrency(actualContracted, currency)}
        </div>
        <div className="text-[11px] text-stone-600 dark:text-zinc-400">Committed obligations</div>
      </Card>

      <Card className="p-4 space-y-1 rounded-2xl border-stone-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Amount Paid</span>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {formatCurrency(paidAmount, currency)}
        </div>
        <div className="text-[11px] text-stone-600 dark:text-zinc-400">Vendor advances settled</div>
      </Card>

      <Card className="p-4 space-y-1 rounded-2xl border-stone-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Remaining Buffer</span>
          <PiggyBank className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
          {formatCurrency(remainingBudget, currency)}
        </div>
        <div className="text-[11px] text-stone-600 dark:text-zinc-400">Available uncommitted</div>
      </Card>
    </div>
  );
};

export const BudgetSummaryStrip = React.memo(BudgetSummaryStripComponent);


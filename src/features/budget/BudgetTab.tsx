import React, { useMemo, useCallback } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CategoryRow } from './CategoryRow';
import { TaxAndCateringCalc } from './TaxAndCateringCalc';
import { MilestoneTracker } from './MilestoneTracker';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { calculateGstTax } from './budgetMath';
import {
  RotateCcw,
  Download,
  Printer,
  AlertTriangle,
} from 'lucide-react';

export const BudgetTab: React.FC = () => {
  const {
    state,
    currency,
    updateBudgetItem,
    autoBalanceBudget,
  } = useWorkspace();

  const totals = useMemo(() => {
    const allocated = state.budgetItems.reduce((acc, b) => acc + b.allocated, 0);
    const quotes = state.budgetItems.reduce((acc, b) => acc + b.vendorQuote, 0);
    const actual = state.budgetItems.reduce((acc, b) => acc + b.actualContracted, 0);
    const paid = state.budgetItems.reduce((acc, b) => acc + b.amountPaid, 0);

    const taxAmount = state.includeTaxInTotals ? calculateGstTax(actual, state.taxRatePercent) : 0;
    const finalTotalWithTax = actual + taxAmount;
    const variance = actual - state.event.targetBudget;
    const isOverBudget = variance > 0;

    return {
      allocated,
      quotes,
      actual,
      paid,
      taxAmount,
      finalTotalWithTax,
      variance,
      isOverBudget,
    };
  }, [state.budgetItems, state.event.targetBudget, state.includeTaxInTotals, state.taxRatePercent]);

  const handleExportCsv = useCallback(() => {
    let csv = 'Category,Item Name,Allocated,Vendor Quote,Contracted Actual,Amount Paid,Status\n';
    state.budgetItems.forEach((item) => {
      csv += `"${item.category}","${item.name}",${item.allocated},${item.vendorQuote},${item.actualContracted},${item.amountPaid},${item.isLocked ? 'Locked' : 'Unlocked'}\n`;
    });
    csv += `TOTALS,,${totals.allocated},${totals.quotes},${totals.actual},${totals.paid},\n`;
    if (state.includeTaxInTotals) {
      csv += `Statutory Tax (${state.taxRatePercent}%),,,,${totals.taxAmount},,\n`;
      csv += `Gross Total with Tax,,,,${totals.finalTotalWithTax},,\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.event.name.toLowerCase().replace(/\s+/g, '-')}-budget.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.budgetItems, state.event.name, state.includeTaxInTotals, state.taxRatePercent, totals]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Controls & Financial Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#18181B] dark:text-[#FAFAFA] tracking-tight">
            Financial-Grade Smart Budget Engine
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Real-time three-column tracking with auto-rebalance sliders and vendor contract sync
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={autoBalanceBudget}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Auto-Balance 100%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Sheet
          </Button>
        </div>
      </div>

      {/* Variance Alert Banner */}
      {totals.isOverBudget && (
        <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>Over-Budget Warning:</strong> Actual commitments exceed target budget by{' '}
            <strong className="font-mono tabular-nums">{formatCurrency(totals.variance, currency)}</strong>.
            Unlock non-critical categories and click "Auto-Balance 100%" or negotiate vendor quotes.
          </span>
        </div>
      )}

      {/* Interactive Main Budget Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-50 dark:bg-zinc-900/60 border-b border-stone-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              <tr>
                <th className="py-3 px-3">Budget Category & Lock</th>
                <th className="py-3 px-3 w-64">Target Allocation</th>
                <th className="py-3 px-3">Estimated Quote</th>
                <th className="py-3 px-3">Actual Contracted</th>
                <th className="py-3 px-3">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/60">
              {state.budgetItems.map((item) => (
                <CategoryRow
                  key={item.id}
                  item={item}
                  totalBudget={state.event.targetBudget}
                  currency={currency}
                  onUpdate={(partial) => updateBudgetItem(item.id, partial)}
                />
              ))}
            </tbody>
            {/* Table Summary Footer */}
            <tfoot className="bg-stone-50 dark:bg-zinc-900/80 border-t-2 border-stone-300 dark:border-zinc-700 font-mono font-bold text-xs text-stone-900 dark:text-white tabular-nums">
              <tr>
                <td className="py-3 px-3 uppercase text-[11px] font-sans">
                  Total Commitments
                </td>
                <td className="py-3 px-3">
                  {formatCurrency(totals.allocated, currency)}
                </td>
                <td className="py-3 px-3 text-stone-600 dark:text-zinc-400">
                  {formatCurrency(totals.quotes, currency)}
                </td>
                <td className={`py-3 px-3 ${totals.isOverBudget ? 'text-rose-600' : 'text-stone-900 dark:text-white'}`}>
                  {formatCurrency(totals.actual, currency)}
                </td>
                <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totals.paid, currency)}
                </td>
              </tr>
              {state.includeTaxInTotals && (
                <tr className="text-stone-500 dark:text-zinc-400 font-normal">
                  <td colSpan={3} className="py-2 px-3 text-right">
                    Statutory Tax ({state.taxRatePercent}% GST applied):
                  </td>
                  <td colSpan={2} className="py-2 px-3 text-stone-800 dark:text-zinc-200">
                    +{formatCurrency(totals.taxAmount, currency)}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Dynamic Calculators */}
      <TaxAndCateringCalc />

      {/* Payment Milestone Tracker */}
      <MilestoneTracker />
    </div>
  );
};

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CategoryRow } from './CategoryRow';
import { BudgetSummaryStrip } from './BudgetSummaryStrip';
import { TaxAndCateringCalc } from './TaxAndCateringCalc';
import { MilestoneTracker } from './MilestoneTracker';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { calculateGstTax } from './budgetMath';
import { exportBudgetToCsv } from './budgetExport';
import { RotateCcw, Download, Printer, AlertTriangle, ChevronDown } from 'lucide-react';

export const BudgetTab: React.FC = () => {
  const { state, currency, updateBudgetItem, autoBalanceBudget } = useWorkspace();

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const totals = useMemo(() => {
    const allocated = state.budgetItems.reduce((acc, b) => acc + b.allocated, 0);
    const quotes = state.budgetItems.reduce((acc, b) => acc + b.vendorQuote, 0);
    const actual = state.budgetItems.reduce((acc, b) => acc + b.actualContracted, 0);
    const paid = state.budgetItems.reduce((acc, b) => acc + b.amountPaid, 0);

    const taxAmount = state.includeTaxInTotals ? calculateGstTax(actual, state.taxRatePercent) : 0;
    const finalTotalWithTax = actual + taxAmount;
    const variance = actual - state.event.targetBudget;
    const remainingBudget = Math.max(0, state.event.targetBudget - actual);
    const isOverBudget = variance > 0;

    return {
      allocated,
      quotes,
      actual,
      paid,
      taxAmount,
      finalTotalWithTax,
      variance,
      remainingBudget,
      isOverBudget,
    };
  }, [state.budgetItems, state.event.targetBudget, state.includeTaxInTotals, state.taxRatePercent]);

  const handleExportCsv = useCallback(() => {
    exportBudgetToCsv(state.budgetItems, totals, state.event.name, state.includeTaxInTotals, state.taxRatePercent);
    setExportMenuOpen(false);
  }, [state.budgetItems, state.event.name, state.includeTaxInTotals, state.taxRatePercent, totals]);

  const handlePrint = useCallback(() => {
    setExportMenuOpen(false);
    window.print();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header & Financial Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#18181B] dark:text-[#FAFAFA] tracking-tight">
            Financial-Grade Smart Budget Engine
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
            Real-time multi-category tracking with auto-rebalance sliders and vendor contract sync
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={autoBalanceBudget}
            icon={<RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
          >
            Auto-Balance 100%
          </Button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              <span>Export</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#18181B] border border-stone-200 dark:border-zinc-800 rounded-xl shadow-lg p-1.5 z-30">
                <button
                  onClick={handleExportCsv}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-500" />
                  <span>Print Worksheet</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Financial Summary Strip */}
      <BudgetSummaryStrip
        targetBudget={state.event.targetBudget}
        actualContracted={totals.actual}
        paidAmount={totals.paid}
        remainingBudget={totals.remainingBudget}
        isOverBudget={totals.isOverBudget}
        currency={currency}
      />

      {/* Variance Alert Banner */}
      {totals.isOverBudget && (
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>Over-Budget Warning:</strong> Actual contracted commitments exceed target budget by{' '}
            <strong className="font-mono tabular-nums">{formatCurrency(totals.variance, currency)}</strong>.
            Unlock non-critical categories and click "Auto-Balance 100%" to rebalance.
          </span>
        </div>
      )}

      {/* Interactive Main Budget Table */}
      <Card className="p-0 overflow-hidden rounded-2xl border-stone-200 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-50 dark:bg-zinc-900/60 border-b border-stone-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              <tr>
                <th className="py-3.5 px-4">Category & Sub-Item</th>
                <th className="py-3.5 px-4 w-72">Target Allocation</th>
                <th className="py-3.5 px-4">Actual Contracted</th>
                <th className="py-3.5 px-4">Amount Paid</th>
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
                <td className="py-3.5 px-4 uppercase text-[11px] font-sans">
                  Total Commitments
                </td>
                <td className="py-3.5 px-4">
                  {formatCurrency(totals.allocated, currency)}
                </td>
                <td className={`py-3.5 px-4 ${totals.isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-white'}`}>
                  {formatCurrency(totals.actual, currency)}
                </td>
                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totals.paid, currency)}
                </td>
              </tr>
              {state.includeTaxInTotals && (
                <tr className="text-stone-500 dark:text-zinc-400 font-normal">
                  <td colSpan={2} className="py-2.5 px-4 text-right">
                    Statutory Tax ({state.taxRatePercent}% GST applied):
                  </td>
                  <td colSpan={2} className="py-2.5 px-4 text-stone-800 dark:text-zinc-200">
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

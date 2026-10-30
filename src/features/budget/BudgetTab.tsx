import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CategoryRow } from './CategoryRow';
import { BudgetSummaryStrip } from './BudgetSummaryStrip';
import { AddBudgetItemModal } from './AddBudgetItemModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { calculateGstTax } from './budgetMath';
import { Plus, RotateCcw, Download, Printer, MoreHorizontal } from 'lucide-react';

export const BudgetTab: React.FC = () => {
  const {
    state,
    currency,
    updateBudgetItem,
    autoBalanceBudget,
    addBudgetItem,
    deleteBudgetItem,
    toggleTax,
  } = useWorkspace();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
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
    const headers = ['Category', 'Item Name', 'Allocated', 'Vendor Quote', 'Contracted', 'Paid', 'Locked'];
    const rows = state.budgetItems.map((b) => [
      b.category,
      `"${b.name.replace(/"/g, '""')}"`,
      b.allocated,
      b.vendorQuote,
      b.actualContracted,
      b.amountPaid,
      b.isLocked ? 'Yes' : 'No',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${state.event.name.toLowerCase().replace(/\s+/g, '-')}-budget-ledger.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [state.budgetItems, state.event.name]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Financial-Grade Smart Budget Engine"
        subtitle="Multi-category cost allocation with auto-rebalancing and contract sync"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              icon={<Plus />}
            >
              Add line item
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={autoBalanceBudget}
              icon={<RotateCcw />}
            >
              Auto-balance
            </Button>

            <div className="relative" ref={moreRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                aria-label="More budget actions"
              >
                <MoreHorizontal className="w-4 h-4 stroke-[1.5]" />
              </Button>

              {moreMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#161618] border border-stone-200/80 dark:border-white/[0.08] rounded-xl shadow-lg p-1 z-30 animate-fade-in text-xs">
                  <button
                    onClick={() => {
                      handleExportCsv();
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 dark:text-[#EDEDEF] hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 dark:text-[#EDEDEF] hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Print worksheet</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* Single Stats Strip on Top */}
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
        <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>
            <strong>Over budget:</strong> Contracted commitments exceed target by{' '}
            <strong className="tabular-nums">{formatCurrency(totals.variance, currency)}</strong>. Unlock non-critical categories and use "Auto-balance" to reweight.
          </span>
        </div>
      )}

      {/* Clean Borderless Table */}
      <div className="border border-stone-200/80 dark:border-white/[0.08] rounded-xl overflow-hidden bg-white dark:bg-[#111113]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-50/80 dark:bg-white/[0.02] border-b border-stone-200/80 dark:border-white/[0.08] text-xs font-normal text-stone-500 dark:text-[#8B8B93] sticky top-0">
              <tr>
                <th className="py-3 px-4 font-normal">Category & line item</th>
                <th className="py-3 px-4 w-72 font-normal">Target allocation</th>
                <th className="py-3 px-4 text-right font-normal">Contracted</th>
                <th className="py-3 px-4 text-right font-normal">Amount paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-white/[0.04]">
              {state.budgetItems.map((item) => (
                <CategoryRow
                  key={item.id}
                  item={item}
                  totalBudget={state.event.targetBudget}
                  currency={currency}
                  onUpdate={(partial) => updateBudgetItem(item.id, partial)}
                  onDelete={() => deleteBudgetItem(item.id)}
                />
              ))}
            </tbody>
            {/* Table Summary Footer */}
            <tfoot className="border-t border-stone-200/80 dark:border-white/[0.08] bg-stone-50/50 dark:bg-white/[0.02] text-xs tabular-nums text-stone-800 dark:text-[#EDEDEF] font-medium">
              <tr>
                <td className="py-3.5 px-4 font-semibold">Subtotal allocations</td>
                <td className="py-3.5 px-4">{formatCurrency(totals.allocated, currency)}</td>
                <td className="py-3.5 px-4 text-right font-semibold">{formatCurrency(totals.actual, currency)}</td>
                <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.paid, currency)}</td>
              </tr>
              {state.includeTaxInTotals && (
                <tr className="border-t border-stone-200/60 dark:border-white/[0.04] text-[11px] text-stone-500 dark:text-[#8B8B93]">
                  <td className="py-2.5 px-4">Statutory tax estimate ({state.taxRatePercent}%)</td>
                  <td className="py-2.5 px-4">—</td>
                  <td className="py-2.5 px-4 text-right">+{formatCurrency(totals.taxAmount, currency)}</td>
                  <td className="py-2.5 px-4 text-right">—</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        {/* Bottom tax toggle strip */}
        <div className="p-3 border-t border-stone-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs text-stone-500 dark:text-[#8B8B93] bg-stone-50/30 dark:bg-white/[0.01]">
          <span>Tax configuration: {state.taxRatePercent}% statutory GST/VAT</span>
          <button
            onClick={() => toggleTax(!state.includeTaxInTotals)}
            className="text-xs text-[#6E79F5] hover:text-[#5D68E2] transition-colors"
          >
            {state.includeTaxInTotals ? 'Exclude tax from total' : 'Include tax in total'}
          </button>
        </div>
      </div>

      <AddBudgetItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBudgetItem={addBudgetItem}
        currency={currency}
      />
    </div>
  );
};

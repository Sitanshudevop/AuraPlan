import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CategoryRow } from './CategoryRow';
import { BudgetSummaryStrip } from './BudgetSummaryStrip';
import { AddBudgetItemModal } from './AddBudgetItemModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { Plus, RotateCcw } from 'lucide-react';
import { useBudgetTotals } from './useBudgetTotals';
import { BudgetExportMenu } from './BudgetExportMenu';
import { BudgetTableFooter } from './BudgetTableFooter';

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

  const totals = useBudgetTotals(
    state.budgetItems,
    state.event.targetBudget,
    state.includeTaxInTotals,
    state.taxRatePercent
  );

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

            <BudgetExportMenu
              budgetItems={state.budgetItems}
              eventName={state.event.name}
            />
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
            <BudgetTableFooter
              totals={totals}
              currency={currency}
              includeTaxInTotals={state.includeTaxInTotals}
              taxRatePercent={state.taxRatePercent}
            />
          </table>
        </div>

        {/* Bottom tax toggle strip */}
        <div className="p-3 border-t border-stone-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs text-stone-500 dark:text-[#8B8B93] bg-stone-50/30 dark:bg-white/[0.01]">
          <span>Tax configuration: {state.taxRatePercent}% statutory GST/VAT</span>
          <button
            onClick={() => toggleTax(!state.includeTaxInTotals)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
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

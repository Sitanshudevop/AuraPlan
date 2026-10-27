import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { calculatePerPlateTotal } from './budgetMath';
import { Utensils, ReceiptText } from 'lucide-react';

export const TaxAndCateringCalc: React.FC = () => {
  const { state, currency, toggleTax, setTaxRate, updateBudgetItem } = useWorkspace();

  const cateringItem = state.budgetItems.find((b) => b.category === 'catering');
  const [perPlateRate, setPerPlateRate] = useState<number>(
    cateringItem && state.event.guestCount > 0
      ? Math.round(cateringItem.allocated / state.event.guestCount)
      : 1500
  );

  const calculatedCateringTotal = calculatePerPlateTotal(perPlateRate, state.event.guestCount);

  const handleApplyCatering = () => {
    if (cateringItem) {
      updateBudgetItem(cateringItem.id, {
        allocated: calculatedCateringTotal,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Dynamic Catering Per-Plate Calculator */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-zinc-200">
            <Utensils className="w-4 h-4 text-amber-600" />
            <span>Per-Plate Catering Calculator</span>
          </div>
          <span className="text-[11px] font-mono tabular-nums font-medium text-stone-500">
            {state.event.guestCount} Guests
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 dark:text-zinc-400">Rate per Cover:</span>
            <span className="font-mono font-bold text-stone-900 dark:text-white tabular-nums">
              {formatCurrency(perPlateRate, currency)}
            </span>
          </div>

          <input
            type="range"
            min="300"
            max="5000"
            step="50"
            value={perPlateRate}
            onChange={(e) => setPerPlateRate(Number(e.target.value))}
            className="w-full h-1.5 bg-stone-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-white"
          />

          <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-zinc-800/60">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold">Total Catering Math:</span>
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(calculatedCateringTotal, currency)}
              </div>
            </div>
            <button
              onClick={handleApplyCatering}
              className="px-2.5 py-1 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 rounded-md transition-colors"
            >
              Sync to Catering Budget
            </button>
          </div>
        </div>
      </Card>

      {/* Tax / GST Surcharge Engine */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-zinc-200">
            <ReceiptText className="w-4 h-4 text-indigo-600" />
            <span>Tax & GST Multiplier Engine</span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={state.includeTaxInTotals}
              onChange={(e) => toggleTax(e.target.checked)}
              className="rounded accent-stone-900 dark:accent-white"
            />
            <span className="text-stone-600 dark:text-zinc-400 font-medium">Apply Tax</span>
          </label>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 dark:text-zinc-400">Statutory Rate:</span>
            <div className="flex items-center gap-1">
              {[5, 12, 18, 28].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setTaxRate(rate)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded ${
                    state.taxRatePercent === rate
                      ? 'bg-[#18181B] text-white dark:bg-white dark:text-stone-900 font-bold'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-stone-500 dark:text-zinc-400 pt-1 border-t border-stone-200/60 dark:border-zinc-800/60">
            Tax impact automatically reflects in export reports and audited executive sheets.
          </p>
        </div>
      </Card>
    </div>
  );
};

import { useMemo } from 'react';
import { BudgetItem } from '../../types/budget';
import { calculateGstTax } from './budgetMath';

export interface BudgetTotals {
  allocated: number;
  quotes: number;
  actual: number;
  paid: number;
  taxAmount: number;
  finalTotalWithTax: number;
  variance: number;
  remainingBudget: number;
  isOverBudget: boolean;
}

export function useBudgetTotals(
  budgetItems: BudgetItem[],
  targetBudget: number,
  includeTaxInTotals: boolean,
  taxRatePercent: number
): BudgetTotals {
  return useMemo(() => {
    const allocated = budgetItems.reduce((acc, b) => acc + b.allocated, 0);
    const quotes = budgetItems.reduce((acc, b) => acc + b.vendorQuote, 0);
    const actual = budgetItems.reduce((acc, b) => acc + b.actualContracted, 0);
    const paid = budgetItems.reduce((acc, b) => acc + b.amountPaid, 0);

    const taxAmount = includeTaxInTotals ? calculateGstTax(actual, taxRatePercent) : 0;
    const finalTotalWithTax = actual + taxAmount;
    const variance = actual - targetBudget;
    const remainingBudget = Math.max(0, targetBudget - actual);
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
  }, [budgetItems, targetBudget, includeTaxInTotals, taxRatePercent]);
}


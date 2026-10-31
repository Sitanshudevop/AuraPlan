import { BudgetItem } from '../../types/budget';
import { buildCsv } from '../../utils/csv';

export interface BudgetTotals {
  allocated: number;
  quotes: number;
  actual: number;
  paid: number;
  taxAmount: number;
  finalTotalWithTax: number;
}

export const exportBudgetToCsv = (
  items: BudgetItem[],
  totals: BudgetTotals,
  eventName: string,
  includeTax: boolean,
  taxRatePercent: number
): void => {
  const headers = ['Category', 'Item Name', 'Allocated', 'Vendor Quote', 'Contracted Actual', 'Amount Paid', 'Status'];
  const rows: (string | number)[][] = items.map((item) => [
    item.category,
    item.name,
    item.allocated,
    item.vendorQuote,
    item.actualContracted,
    item.amountPaid,
    item.isLocked ? 'Locked' : 'Unlocked',
  ]);

  rows.push(['TOTALS', '', totals.allocated, totals.quotes, totals.actual, totals.paid, '']);

  if (includeTax) {
    rows.push([`Statutory Tax (${taxRatePercent}%)`, '', '', '', totals.taxAmount, '', '']);
    rows.push(['Gross Total with Tax', '', '', '', totals.finalTotalWithTax, '', '']);
  }

  const csv = buildCsv(headers, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${eventName.toLowerCase().replace(/\s+/g, '-')}-budget.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

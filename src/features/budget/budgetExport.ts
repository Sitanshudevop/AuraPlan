import { BudgetItem } from '../../types/budget';

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
  let csv = 'Category,Item Name,Allocated,Vendor Quote,Contracted Actual,Amount Paid,Status\n';
  items.forEach((item) => {
    csv += `"${item.category}","${item.name}",${item.allocated},${item.vendorQuote},${item.actualContracted},${item.amountPaid},${item.isLocked ? 'Locked' : 'Unlocked'}\n`;
  });
  csv += `TOTALS,,${totals.allocated},${totals.quotes},${totals.actual},${totals.paid},\n`;
  if (includeTax) {
    csv += `Statutory Tax (${taxRatePercent}%),,,,${totals.taxAmount},,\n`;
    csv += `Gross Total with Tax,,,,${totals.finalTotalWithTax},,\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${eventName.toLowerCase().replace(/\s+/g, '-')}-budget.csv`;
  a.click();
  URL.revokeObjectURL(url);
};


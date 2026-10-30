import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { BudgetItem } from '../../types/budget';
import { Download, Printer, MoreHorizontal } from 'lucide-react';

interface BudgetExportMenuProps {
  budgetItems: BudgetItem[];
  eventName: string;
}

export const BudgetExportMenu: React.FC<BudgetExportMenuProps> = ({ budgetItems, eventName }) => {
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

  const handleExportCsv = useCallback(() => {
    const headers = ['Category', 'Item Name', 'Allocated', 'Vendor Quote', 'Contracted', 'Paid', 'Locked'];
    const rows = budgetItems.map((b) => [
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
    link.setAttribute('download', `${eventName.toLowerCase().replace(/\s+/g, '-')}-budget-ledger.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [budgetItems, eventName]);

  return (
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
  );
};


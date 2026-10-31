import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vendor, VendorStatus } from '../../types/vendor';
import { Currency } from '../../types/event';
import { VendorKanbanCard } from './VendorKanbanCard';
import { Select } from '../../components/ui/Select';
import { VendorKanbanColumn } from './VendorKanbanColumn';

interface VendorKanbanProps {
  vendors: Vendor[];
  currency: Currency;
  onUpdateVendor: (id: string, partial: Partial<Vendor>) => void;
  onDeleteVendor?: (id: string) => void;
  onOpenNegotiation: (vendor: Vendor) => void;
}

export const KANBAN_COLUMNS: { id: VendorStatus; title: string }[] = [
  { id: 'shortlisted', title: 'Shortlisted' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'quote_received', title: 'Quote Received' },
  { id: 'contract_signed', title: 'Contract Signed' },
  { id: 'paid', title: 'Paid in Full' },
];

export const NEXT_STATUS_MAP: Record<VendorStatus, VendorStatus | null> = {
  shortlisted: 'contacted',
  contacted: 'quote_received',
  quote_received: 'contract_signed',
  contract_signed: 'paid',
  paid: null,
};

export const VendorKanban: React.FC<VendorKanbanProps> = ({
  vendors,
  currency,
  onUpdateVendor,
  onDeleteVendor,
  onOpenNegotiation,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mobileStage, setMobileStage] = useState<VendorStatus>('shortlisted');

  const checkScroll = useCallback(() => {
    const el = boardRef.current;
    if (!el) return;
    const hasMore = el.scrollLeft + el.clientWidth < el.scrollWidth - 12;
    setCanScrollRight(hasMore);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, vendors]);

  const mobileOptions = KANBAN_COLUMNS.map((col) => ({
    value: col.id,
    label: `${col.title} (${vendors.filter((v) => v.status === col.id).length})`,
  }));

  const activeMobileVendors = vendors.filter((v) => v.status === mobileStage);
  const nextMobileStatus = NEXT_STATUS_MAP[mobileStage];
  const nextMobileTitle = KANBAN_COLUMNS.find((c) => c.id === nextMobileStatus)?.title;

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col">
      {/* Mobile Stage Selector (< 640px / 390px) */}
      <div className="sm:hidden mb-3 shrink-0">
        <label htmlFor="kanban-stage-select" className="block text-xs font-medium text-stone-500 dark:text-[#8B8B93] mb-1">
          Pipeline stage
        </label>
        <Select
          options={mobileOptions}
          value={mobileStage}
          onChange={(val) => setMobileStage(val as VendorStatus)}
          ariaLabel="Select pipeline stage"
        />
      </div>

      {/* Mobile Column View (< 640px) */}
      <div className="sm:hidden flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {activeMobileVendors.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-500 dark:text-zinc-500">
            No vendors in this stage
          </div>
        ) : (
          activeMobileVendors.map((vendor) => (
            <VendorKanbanCard
              key={vendor.id}
              vendor={vendor}
              currency={currency}
              nextStatus={nextMobileStatus}
              nextStatusTitle={nextMobileTitle}
              onUpdateVendor={onUpdateVendor}
              onDeleteVendor={onDeleteVendor}
              onOpenNegotiation={onOpenNegotiation}
            />
          ))
        )}
      </div>

      {/* Desktop / Tablet Multi-Column Horizontal Board (>= 640px) */}
      <div className="hidden sm:flex relative flex-1 min-h-0 min-w-0 flex-col">
        <div
          ref={boardRef}
          onScroll={checkScroll}
          className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-4 flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-hidden scrollbar-thin snap-x snap-mandatory pb-3"
        >
          {KANBAN_COLUMNS.map((col) => {
            const colVendors = vendors.filter((v) => v.status === col.id);
            const nextStatus = NEXT_STATUS_MAP[col.id];
            const nextTitle = KANBAN_COLUMNS.find((c) => c.id === nextStatus)?.title;

            return (
              <VendorKanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                vendors={colVendors}
                currency={currency}
                nextStatus={nextStatus}
                nextTitle={nextTitle}
                onUpdateVendor={onUpdateVendor}
                onDeleteVendor={onDeleteVendor}
                onOpenNegotiation={onOpenNegotiation}
              />
            );
          })}
        </div>

        {/* Subtle Right Edge Fade Indicator when more columns exist */}
        {canScrollRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-[#FAF9F6] dark:from-[#0B0B0C] to-transparent z-10 transition-opacity"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

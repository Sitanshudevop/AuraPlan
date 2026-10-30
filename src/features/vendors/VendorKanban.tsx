import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vendor, VendorStatus } from '../../types/vendor';
import { Currency } from '../../types/event';
import { VendorKanbanCard } from './VendorKanbanCard';
import { Select } from '../../components/ui/Select';

interface VendorKanbanProps {
  vendors: Vendor[];
  currency: Currency;
  onUpdateVendor: (id: string, partial: Partial<Vendor>) => void;
  onDeleteVendor?: (id: string) => void;
  onOpenNegotiation: (vendor: Vendor) => void;
}

const columns: { id: VendorStatus; title: string }[] = [
  { id: 'shortlisted', title: 'Shortlisted' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'quote_received', title: 'Quote Received' },
  { id: 'contract_signed', title: 'Contract Signed' },
  { id: 'paid', title: 'Paid in Full' },
];

const nextStatusMap: Record<VendorStatus, VendorStatus | null> = {
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

  const mobileOptions = columns.map((col) => ({
    value: col.id,
    label: `${col.title} (${vendors.filter((v) => v.status === col.id).length})`,
  }));

  const activeMobileVendors = vendors.filter((v) => v.status === mobileStage);
  const nextMobileStatus = nextStatusMap[mobileStage];
  const nextMobileTitle = columns.find((c) => c.id === nextMobileStatus)?.title;

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
          <div className="py-12 text-center text-xs text-stone-400 dark:text-zinc-500">
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
          className="flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-hidden scrollbar-thin snap-x snap-mandatory pb-3"
          style={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns: 'minmax(280px, 1fr)',
            gap: '16px',
          }}
        >
          {columns.map((col) => {
            const colVendors = vendors.filter((v) => v.status === col.id);
            const nextStatus = nextStatusMap[col.id];
            const nextTitle = columns.find((c) => c.id === nextStatus)?.title;

            return (
              <div
                key={col.id}
                className="h-full min-h-0 min-w-0 flex flex-col snap-start bg-stone-50/70 dark:bg-white/[0.02] p-2.5 rounded-xl border border-stone-200/80 dark:border-white/[0.08]"
              >
                {/* Sticky Column Header */}
                <div className="shrink-0 flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-white/[0.08] mb-2 px-1">
                  <span className="text-xs font-semibold text-[#111113] dark:text-[#EDEDEF]">
                    {col.title}
                  </span>
                  <span className="text-[11px] tabular-nums text-stone-500 dark:text-[#8B8B93] bg-stone-200/60 dark:bg-white/[0.06] px-1.5 py-0.5 rounded-md font-medium">
                    {colVendors.length}
                  </span>
                </div>

                {/* Column Cards (Independently scrollable) */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin">
                  {colVendors.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-400 dark:text-zinc-500">
                      No vendors
                    </div>
                  ) : (
                    colVendors.map((vendor) => (
                      <VendorKanbanCard
                        key={vendor.id}
                        vendor={vendor}
                        currency={currency}
                        nextStatus={nextStatus}
                        nextStatusTitle={nextTitle}
                        onUpdateVendor={onUpdateVendor}
                        onDeleteVendor={onDeleteVendor}
                        onOpenNegotiation={onOpenNegotiation}
                      />
                    ))
                  )}
                </div>
              </div>
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
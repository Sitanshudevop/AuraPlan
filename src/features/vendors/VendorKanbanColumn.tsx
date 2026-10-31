import React from 'react';
import { Vendor, VendorStatus } from '../../types/vendor';
import { Currency } from '../../types/event';
import { VendorKanbanCard } from './VendorKanbanCard';

interface VendorKanbanColumnProps {
  id: VendorStatus;
  title: string;
  vendors: Vendor[];
  currency: Currency;
  nextStatus: VendorStatus | null;
  nextTitle?: string;
  onUpdateVendor: (id: string, partial: Partial<Vendor>) => void;
  onDeleteVendor?: (id: string) => void;
  onOpenNegotiation: (vendor: Vendor) => void;
}

export const VendorKanbanColumn: React.FC<VendorKanbanColumnProps> = ({
  title,
  vendors,
  currency,
  nextStatus,
  nextTitle,
  onUpdateVendor,
  onDeleteVendor,
  onOpenNegotiation,
}) => {
  return (
    <div className="h-full min-h-0 min-w-0 flex flex-col snap-start bg-stone-50/70 dark:bg-white/[0.02] p-2.5 rounded-xl border border-stone-200/80 dark:border-white/[0.08]">
      {/* Sticky Column Header */}
      <div className="shrink-0 flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-white/[0.08] mb-2 px-1">
        <span className="text-xs font-semibold text-[#111113] dark:text-[#EDEDEF]">{title}</span>
        <span className="text-[11px] tabular-nums text-stone-500 dark:text-[#8B8B93] bg-stone-200/60 dark:bg-white/[0.06] px-1.5 py-0.5 rounded-md font-medium">
          {vendors.length}
        </span>
      </div>

      {/* Column Cards (Independently scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin">
        {vendors.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500 dark:text-zinc-500">
            No vendors
          </div>
        ) : (
          vendors.map((vendor) => (
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
};


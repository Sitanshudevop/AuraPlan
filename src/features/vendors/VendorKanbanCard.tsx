import React from 'react';
import { Vendor, VendorStatus } from '../../types/vendor';
import { Currency } from '../../types/event';
import { formatCurrency, formatCategory } from '../../utils/formatters';
import { StatusDot } from '../../components/ui/StatusDot';
import { ArrowRight, Star } from 'lucide-react';
import { VendorCardActionMenu } from './VendorCardActionMenu';

interface VendorKanbanCardProps {
  vendor: Vendor;
  currency: Currency;
  nextStatus: VendorStatus | null;
  nextStatusTitle?: string;
  onUpdateVendor: (id: string, partial: Partial<Vendor>) => void;
  onDeleteVendor?: (id: string) => void;
  onOpenNegotiation: (vendor: Vendor) => void;
}

const VendorKanbanCardComponent: React.FC<VendorKanbanCardProps> = ({
  vendor,
  currency,
  nextStatus,
  nextStatusTitle,
  onUpdateVendor,
  onDeleteVendor,
  onOpenNegotiation,
}) => {
  const handleQuickAdvance = () => {
    if (!nextStatus) return;
    const newContracted =
      nextStatus === 'contract_signed' && vendor.contractedPrice === 0
        ? vendor.estimatedPrice
        : vendor.contractedPrice;
    onUpdateVendor(vendor.id, {
      status: nextStatus,
      contractedPrice: newContracted,
    });
  };

  const isContracted = vendor.contractedPrice > 0;
  const displayPrice = isContracted ? vendor.contractedPrice : vendor.estimatedPrice;

  return (
    <div className="group relative bg-white dark:bg-[#161618] rounded-xl border border-stone-200/80 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/[0.14] p-3 text-xs flex flex-col justify-between gap-1.5 min-w-0 transition-colors shadow-xs">
      {/* Row 1: Vendor Name (left) + Rating / Actions (right) */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <h4
          className="font-medium text-[#111113] dark:text-[#EDEDEF] line-clamp-2 leading-snug flex-1 min-w-0 text-left"
          title={vendor.name}
        >
          {vendor.name}
        </h4>

        <div className="flex items-center gap-1 shrink-0">
          {vendor.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] tabular-nums text-stone-500 dark:text-[#8B8B93]" title={`Rating: ${vendor.rating} / 5`}>
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span>{vendor.rating}</span>
            </span>
          )}

          <VendorCardActionMenu
            vendor={vendor}
            nextStatus={nextStatus}
            onUpdateVendor={onUpdateVendor}
            onDeleteVendor={onDeleteVendor}
            onOpenNegotiation={onOpenNegotiation}
          />
        </div>
      </div>

      {/* Row 2: Category as muted text · Location as muted text */}
      <div className="text-[11px] text-stone-500 dark:text-[#8B8B93] truncate min-w-0 flex items-center gap-1.5">
        <span className="font-normal">{formatCategory(vendor.category)}</span>
        <span className="text-stone-300 dark:text-zinc-600">·</span>
        <span className="truncate">{vendor.location || 'Local Region'}</span>
      </div>

      {/* Row 3: Amount + Status Dot/Text (e.g. ₹32,000 · Contracted) */}
      <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-white/[0.04] min-w-0">
        <div className="flex items-center gap-1.5 text-xs tabular-nums min-w-0">
          <span className="font-medium text-[#111113] dark:text-[#EDEDEF]">
            {isContracted ? '' : 'Est. '}
            {formatCurrency(displayPrice, currency)}
          </span>
          <span className="text-stone-300 dark:text-zinc-600">·</span>
          <div className="flex items-center gap-1 shrink-0">
            <StatusDot status={isContracted ? 'confirmed' : 'pending'} size="xs" />
            <span className="text-xs text-stone-500 dark:text-[#8B8B93]">
              {isContracted ? 'Contracted' : 'Quote'}
            </span>
          </div>
        </div>

        {/* Hover quick-advance affordance */}
        {nextStatus && (
          <button
            type="button"
            onClick={handleQuickAdvance}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-xs text-stone-500 dark:text-[#8B8B93] hover:text-[#6E79F5] dark:hover:text-[#6E79F5] flex items-center gap-0.5 transition-opacity px-1 py-0.5 rounded hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            title={`Advance to ${nextStatusTitle || nextStatus}`}
          >
            <span>Next</span>
            <ArrowRight className="w-3 h-3 stroke-[1.5]" />
          </button>
        )}
      </div>
    </div>
  );
};

export const VendorKanbanCard = React.memo(
  VendorKanbanCardComponent,
  (prev, next) =>
    prev.vendor.id === next.vendor.id &&
    prev.vendor.status === next.vendor.status &&
    prev.vendor.contractedPrice === next.vendor.contractedPrice &&
    prev.vendor.estimatedPrice === next.vendor.estimatedPrice &&
    prev.vendor.rating === next.vendor.rating &&
    prev.currency === next.currency &&
    prev.nextStatus === next.nextStatus
);

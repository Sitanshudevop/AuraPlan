import React from 'react';
import { Vendor, VendorStatus } from '../../types/vendor';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { ArrowRight, Trash2, MapPin } from 'lucide-react';

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
  return (
    <div
      style={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(280px, 1fr)',
        gap: '16px',
        overflowX: 'auto',
      }}
      className="pb-4 no-scrollbar items-start"
    >
      {columns.map((col) => {
        const colVendors = vendors.filter((v) => v.status === col.id);
        return (
          <div
            key={col.id}
            className="min-w-0 flex flex-col space-y-3 bg-stone-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-stone-200/80 dark:border-white/[0.08]"
          >
            {/* Sticky Column Header */}
            <div className="sticky top-0 bg-stone-50/95 dark:bg-[#111113]/95 backdrop-blur-xs flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-white/[0.08] z-10">
              <span className="text-xs font-medium text-stone-700 dark:text-[#EDEDEF]">
                {col.title}
              </span>
              <span className="text-xs tabular-nums text-stone-400 dark:text-zinc-500">
                {colVendors.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-2.5">
              {colVendors.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400 dark:text-zinc-500">
                  No vendors
                </div>
              ) : (
                colVendors.map((vendor) => {
                  const nextStatus = nextStatusMap[vendor.status];
                  return (
                    <div
                      key={vendor.id}
                      className="p-3.5 bg-white dark:bg-[#161618] rounded-xl border border-stone-200/80 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/[0.14] transition-colors space-y-2 text-xs"
                    >
                      <div>
                        <h4 className="font-medium text-[#111113] dark:text-[#EDEDEF] leading-snug">
                          {vendor.name}
                        </h4>
                        <span className="text-[11px] text-stone-400 dark:text-zinc-500 capitalize">
                          {vendor.category}
                        </span>
                      </div>

                      <div className="tabular-nums">
                        {vendor.contractedPrice > 0 ? (
                          <div className="font-medium text-[#111113] dark:text-[#EDEDEF]">
                            {formatCurrency(vendor.contractedPrice, currency)}
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 ml-1.5 font-normal">
                              Contracted
                            </span>
                          </div>
                        ) : (
                          <div className="text-stone-500 dark:text-[#8B8B93]">
                            Est. {formatCurrency(vendor.estimatedPrice, currency)}
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-400 dark:text-zinc-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 stroke-[1.5] shrink-0" />
                        <span className="truncate">{vendor.location}</span>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-stone-100 dark:border-white/[0.04] flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenNegotiation(vendor)}
                          className="text-xs text-[#6E79F5] hover:text-[#5D68E2] transition-colors font-normal"
                        >
                          Vet & negotiate
                        </button>

                        <div className="flex items-center gap-1.5">
                          {onDeleteVendor && (
                            <button
                              type="button"
                              onClick={() => onDeleteVendor(vendor.id)}
                              className="p-1 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              aria-label={`Delete ${vendor.name}`}
                              title="Delete vendor"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>
                          )}

                          {nextStatus && (
                            <button
                              type="button"
                              onClick={() => {
                                const newContracted =
                                  nextStatus === 'contract_signed' && vendor.contractedPrice === 0
                                    ? vendor.estimatedPrice
                                    : vendor.contractedPrice;
                                onUpdateVendor(vendor.id, {
                                  status: nextStatus,
                                  contractedPrice: newContracted,
                                });
                              }}
                              className="inline-flex items-center gap-1 text-xs text-stone-600 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF] px-2 py-0.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors"
                              title={`Advance to ${columns.find((c) => c.id === nextStatus)?.title}`}
                            >
                              <span>Next</span>
                              <ArrowRight className="w-3 h-3 stroke-[1.5]" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

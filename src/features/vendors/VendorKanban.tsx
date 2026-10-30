import React from 'react';
import { Vendor, VendorStatus } from '../../types/vendor';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Star, MapPin, Sparkles, ArrowRight, Trash2 } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-4">
      {columns.map((col) => {
        const colVendors = vendors.filter((v) => v.status === col.id);
        return (
          <div
            key={col.id}
            className="bg-stone-100/60 dark:bg-zinc-900/60 rounded-xl p-3 border border-stone-200 dark:border-zinc-800 space-y-3 min-w-[240px]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                {col.title}
              </span>
              <span className="text-[11px] font-mono tabular-nums font-semibold px-1.5 py-0.5 bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded">
                {colVendors.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {colVendors.length === 0 ? (
                <div className="py-6 text-center text-[11px] text-stone-400 border border-dashed border-stone-200 dark:border-zinc-800 rounded-lg">
                  No vendors in stage
                </div>
              ) : (
                colVendors.map((vendor) => {
                  const nextStatus = nextStatusMap[vendor.status];
                return (
                  <div
                    key={vendor.id}
                    className="p-3 bg-white dark:bg-[#121215] rounded-lg border border-stone-200 dark:border-zinc-800 shadow-xs hover:border-stone-300 dark:hover:border-zinc-700 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white leading-tight">
                          {vendor.name}
                        </h4>
                        <span className="text-[10px] uppercase font-semibold text-stone-400">
                          {vendor.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[11px] font-mono tabular-nums font-semibold text-amber-600 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{vendor.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-bold text-stone-800 dark:text-zinc-200 tabular-nums">
                      {vendor.contractedPrice > 0 ? (
                        <div>
                          <span>{formatCurrency(vendor.contractedPrice, currency)}</span>
                          <span className="text-[10px] text-emerald-600 font-sans block font-normal">
                            Contracted
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-stone-500">
                            Est: {formatCurrency(vendor.estimatedPrice, currency)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-stone-500 dark:text-zinc-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{vendor.location}</span>
                    </div>

                    {/* Actions: AI Negotiation + Pipeline Advance */}
                    <div className="pt-2 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between gap-1">
                      <button
                        onClick={() => onOpenNegotiation(vendor)}
                        className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                        title="Generate outreach scripts and vetting checklist"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Vet & Negotiate</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {onDeleteVendor && (
                          <button
                            type="button"
                            onClick={() => onDeleteVendor(vendor.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                            aria-label={`Delete ${vendor.name}`}
                            title="Delete vendor"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}

                        {nextStatus && (
                          <button
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
                            className="flex items-center gap-0.5 text-[10px] font-medium text-stone-500 hover:text-stone-900 dark:hover:text-white px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800"
                            title={`Move to ${columns.find((c) => c.id === nextStatus)?.title}`}
                          >
                            <span>Next</span>
                            <ArrowRight className="w-2.5 h-2.5" />
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

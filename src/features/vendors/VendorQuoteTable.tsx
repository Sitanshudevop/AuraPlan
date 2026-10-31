import React from 'react';
import { Vendor } from '../../types/vendor';
import { Currency } from '../../types/event';
import { StatusDot } from '../../components/ui/StatusDot';
import { formatCurrency, formatCategory } from '../../utils/formatters';
import { Trash2 } from 'lucide-react';

interface VendorQuoteTableProps {
  vendors: Vendor[];
  currency: Currency;
  onUpdateVendor: (id: string, partial: Partial<Vendor>) => void;
  onDeleteVendor?: (id: string) => void;
  onOpenNegotiation: (vendor: Vendor) => void;
}

export const VendorQuoteTable: React.FC<VendorQuoteTableProps> = ({
  vendors,
  currency,
  onOpenNegotiation,
  onDeleteVendor,
}) => {
  const getStatusTone = (status: string): 'green' | 'amber' | 'neutral' => {
    switch (status) {
      case 'contract_signed':
      case 'paid':
        return 'green';
      case 'quote_received':
      case 'contacted':
        return 'amber';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-white/[0.08] rounded-xl">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-stone-50/80 dark:bg-white/[0.02] border-b border-stone-200/80 dark:border-white/[0.08] text-xs font-normal text-stone-500 dark:text-[#8B8B93] sticky top-0">
          <tr>
            <th className="py-3 px-4 font-normal">Vendor & category</th>
            <th className="py-3 px-4 font-normal">Rating</th>
            <th className="py-3 px-4 text-right font-normal">Estimated quote</th>
            <th className="py-3 px-4 text-right font-normal">Contracted price</th>
            <th className="py-3 px-4 font-normal">Pipeline status</th>
            <th className="py-3 px-4 font-normal">Scope of deliverables</th>
            <th className="py-3 px-4 text-right font-normal">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200/60 dark:divide-white/[0.04]">
          {vendors.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-xs text-stone-500 dark:text-[#8B8B93]">
                No vendors matching this category filter.
              </td>
            </tr>
          ) : (
            vendors.map((vendor) => (
              <tr key={vendor.id} className="h-14 hover:bg-stone-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <div className="font-medium text-[#111113] dark:text-[#EDEDEF]">
                    {vendor.name}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-zinc-500">
                    {formatCategory(vendor.category)} · {vendor.location}
                  </div>
                </td>

                <td className="py-3 px-4 tabular-nums text-stone-700 dark:text-[#EDEDEF]">
                  <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                  <span className="text-[11px] text-stone-500 dark:text-zinc-500 ml-1">({vendor.ratingCount})</span>
                </td>

                <td className="py-3 px-4 text-right tabular-nums text-stone-600 dark:text-[#8B8B93]">
                  {formatCurrency(vendor.estimatedPrice, currency)}
                </td>

                <td className="py-3 px-4 text-right tabular-nums font-medium text-[#111113] dark:text-[#EDEDEF]">
                  {vendor.contractedPrice > 0 ? (
                    formatCurrency(vendor.contractedPrice, currency)
                  ) : (
                    <span className="text-stone-500 dark:text-zinc-500 font-normal italic">Pending</span>
                  )}
                </td>

                <td className="py-3 px-4">
                  <StatusDot
                    status={getStatusTone(vendor.status)}
                    label={vendor.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  />
                </td>

                <td className="py-3 px-4 max-w-xs">
                  <div className="text-xs text-stone-600 dark:text-[#8B8B93] truncate" title={vendor.deliverables.join(', ')}>
                    {vendor.deliverables.join(', ')}
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onOpenNegotiation(vendor)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                    >
                      Vet & negotiate
                    </button>

                    {onDeleteVendor && (
                      <button
                        type="button"
                        onClick={() => onDeleteVendor(vendor.id)}
                        className="p-1 text-stone-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label={`Delete vendor ${vendor.name}`}
                        title="Delete vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

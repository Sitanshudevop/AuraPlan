import React from 'react';
import { Vendor } from '../../types/vendor';
import { Currency } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Star, Sparkles } from 'lucide-react';

interface VendorQuoteTableProps {
  vendors: Vendor[];
  currency: Currency;
  onUpdateVendor: (id: string, partial: Partial<Vendor>) => void;
  onOpenNegotiation: (vendor: Vendor) => void;
}

export const VendorQuoteTable: React.FC<VendorQuoteTableProps> = ({
  vendors,
  currency,
  onOpenNegotiation,
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'contract_signed':
      case 'paid':
        return 'emerald';
      case 'quote_received':
        return 'indigo';
      case 'contacted':
        return 'amber';
      default:
        return 'stone';
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-[#121215] border border-stone-200 dark:border-zinc-800 rounded-xl">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-stone-50 dark:bg-zinc-900/60 border-b border-stone-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
          <tr>
            <th className="py-3 px-3">Vendor & Category</th>
            <th className="py-3 px-3 font-mono">Rating</th>
            <th className="py-3 px-3 font-mono">Estimated</th>
            <th className="py-3 px-3 font-mono">Contracted Price</th>
            <th className="py-3 px-3">Pipeline Status</th>
            <th className="py-3 px-3">Deliverables</th>
            <th className="py-3 px-3 text-right">Negotiation Studio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/60">
          {vendors.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-xs text-stone-600 dark:text-zinc-400">
                No vendors matching this category filter.
              </td>
            </tr>
          ) : (
            vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-900/30">
              <td className="py-3 px-3">
                <div className="font-bold text-stone-900 dark:text-white">
                  {vendor.name}
                </div>
                <div className="text-[10px] uppercase font-semibold text-stone-600 dark:text-zinc-400">
                  {vendor.category} • {vendor.location}
                </div>
              </td>

              <td className="py-3 px-3 font-mono font-medium tabular-nums">
                <div className="flex items-center gap-1 text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{vendor.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-stone-600 dark:text-zinc-400">({vendor.ratingCount})</span>
                </div>
              </td>

              <td className="py-3 px-3 font-mono text-stone-600 dark:text-zinc-400 tabular-nums">
                {formatCurrency(vendor.estimatedPrice, currency)}
              </td>

              <td className="py-3 px-3 font-mono font-bold text-stone-900 dark:text-white tabular-nums">
                {vendor.contractedPrice > 0 ? (
                  formatCurrency(vendor.contractedPrice, currency)
                ) : (
                  <span className="text-stone-600 dark:text-zinc-400 font-sans font-normal italic">In Negotiation</span>
                )}
              </td>

              <td className="py-3 px-3">
                <Badge variant={getStatusVariant(vendor.status)} size="sm">
                  {vendor.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </td>

              <td className="py-3 px-3 max-w-xs">
                <div className="flex flex-wrap gap-1">
                  {vendor.deliverables.slice(0, 2).map((d, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 truncate"
                    >
                      {d}
                    </span>
                  ))}
                  {vendor.deliverables.length > 2 && (
                    <span className="text-[10px] text-stone-600 dark:text-zinc-400 font-mono tabular-nums">
                      +{vendor.deliverables.length - 2} more
                    </span>
                  )}
                </div>
              </td>

              <td className="py-3 px-3 text-right">
                <button
                  onClick={() => onOpenNegotiation(vendor)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Negotiation Studio</span>
                </button>
              </td>
            </tr>
          ))
          )}
        </tbody>
      </table>
    </div>
  );
};

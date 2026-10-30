import React from 'react';
import { Vendor } from '../../types/vendor';
import { Currency } from '../../types/event';
import { ChecklistRequirement } from '../../data/modalityChecklists';
import { formatCurrency, formatCategory } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { StatusDot } from '../../components/ui/StatusDot';
import { Plus } from 'lucide-react';

interface ChecklistItemCardProps {
  req: ChecklistRequirement;
  matchedVendor: Vendor | null;
  status: 'contracted' | 'sourced' | 'missing';
  currency: Currency;
  onOpenNegotiation: (vendor: Vendor) => void;
  onQuickSource: (req: ChecklistRequirement) => void;
}

export const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({
  req,
  matchedVendor,
  status,
  currency,
  onOpenNegotiation,
  onQuickSource,
}) => {
  return (
    <div className="p-4 rounded-xl border border-stone-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] hover:border-stone-300 dark:hover:border-white/[0.14] transition-colors space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-medium text-[#111113] dark:text-[#EDEDEF] leading-snug">
            {req.roleTitle}
          </h4>
          <div className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">
            {formatCategory(req.category)} · {req.priority}
          </div>
        </div>
        <StatusDot
          status={status === 'contracted' ? 'green' : status === 'sourced' ? 'amber' : 'neutral'}
          label={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      </div>

      <p className="text-xs text-stone-600 dark:text-[#8B8B93] leading-relaxed">
        {req.description}
      </p>

      <div className="pt-2.5 border-t border-stone-100 dark:border-white/[0.04] flex items-center justify-between text-xs">
        {matchedVendor ? (
          <>
            <div className="truncate pr-2">
              <span className="font-medium text-[#111113] dark:text-[#EDEDEF] truncate block">
                {matchedVendor.name}
              </span>
              <span className="text-[11px] text-stone-400 dark:text-zinc-500 tabular-nums">
                {formatCurrency(matchedVendor.contractedPrice || matchedVendor.estimatedPrice, currency)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onOpenNegotiation(matchedVendor)}
            >
              Negotiate
            </Button>
          </>
        ) : (
          <>
            <span className="text-xs text-stone-400 dark:text-zinc-500 tabular-nums">
              Est. {formatCurrency(req.defaultEstimate, currency)}
            </span>
            <Button
              variant="primary"
              size="xs"
              onClick={() => onQuickSource(req)}
              icon={<Plus />}
            >
              Source vendor
            </Button>
          </>
        )}
      </div>
    </div>
  );
};


import React, { useMemo } from 'react';
import { Vendor } from '../../types/vendor';
import { EventType, Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { StatusDot } from '../../components/ui/StatusDot';
import { MODALITY_CHECKLISTS, ChecklistRequirement } from '../../data/modalityChecklists';
import { Plus } from 'lucide-react';

interface Props {
  vendors: Vendor[];
  currency: Currency;
  eventType: EventType;
  onOpenNegotiation: (vendor: Vendor) => void;
  onAddVendor: (vendor: Vendor) => void;
}

export const VendorChecklistView: React.FC<Props> = ({
  vendors, currency, eventType, onOpenNegotiation, onAddVendor,
}) => {
  const requirements = useMemo(() => MODALITY_CHECKLISTS[eventType] || MODALITY_CHECKLISTS.wedding, [eventType]);

  const itemsWithStatus = useMemo(() => {
    return requirements.map((req) => {
      const matchingVendors = vendors.filter((v) => v.category === req.category);
      const contracted = matchingVendors.find((v) => v.status === 'contract_signed' || v.status === 'paid');
      const inProgress = matchingVendors[0];
      const status = contracted ? 'contracted' : inProgress ? 'sourced' : 'missing';
      return { req, matchedVendor: contracted || inProgress || null, status };
    });
  }, [requirements, vendors]);

  const stats = useMemo(() => {
    const contractedCount = itemsWithStatus.filter((i) => i.status === 'contracted').length;
    const sourcedCount = itemsWithStatus.filter((i) => i.status === 'sourced').length;
    const missingCount = itemsWithStatus.filter((i) => i.status === 'missing').length;
    const pct = Math.round((contractedCount / itemsWithStatus.length) * 100);
    return { contractedCount, sourcedCount, missingCount, pct };
  }, [itemsWithStatus]);

  const handleQuickSource = (req: ChecklistRequirement) => {
    onAddVendor({
      id: `v-req-${Date.now()}`,
      name: `${req.roleTitle} (Partner)`,
      category: req.category,
      status: 'shortlisted',
      estimatedPrice: req.defaultEstimate,
      contractedPrice: 0,
      paidAmount: 0,
      contactName: 'Operations Lead',
      phone: '+91 98200 12345',
      email: 'vendor@auraplan.ai',
      rating: 4.8,
      ratingCount: 16,
      location: 'Local Region',
      notes: req.description,
      deliverables: [req.description],
    });
  };

  const modalityTitle = eventType.charAt(0).toUpperCase() + eventType.slice(1);

  return (
    <div className="space-y-5">
      {/* Overview Progress Banner */}
      <div className="p-4 sm:p-5 bg-white dark:bg-[#111113] rounded-xl border border-stone-200/80 dark:border-white/[0.08] space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#111113] dark:text-[#EDEDEF]">
              {modalityTitle} essential vendor checklist
            </h3>
            <p className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5">
              Core vendor categories for {eventType} execution
            </p>
          </div>
          <span className="text-xs font-semibold tabular-nums text-stone-700 dark:text-[#EDEDEF]">
            {stats.pct}% covered
          </span>
        </div>

        <div className="w-full bg-stone-100 dark:bg-white/[0.08] h-1 rounded-full overflow-hidden flex">
          <div className="bg-[#6E79F5] h-full transition-all duration-300" style={{ width: `${(stats.contractedCount / itemsWithStatus.length) * 100}%` }} />
          <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${(stats.sourcedCount / itemsWithStatus.length) * 100}%` }} />
        </div>

        <div className="flex items-center gap-5 text-xs text-stone-500 dark:text-[#8B8B93] tabular-nums">
          <StatusDot status="green" label={`${stats.contractedCount} contracted`} />
          <StatusDot status="amber" label={`${stats.sourcedCount} in progress`} />
          <StatusDot status="neutral" label={`${stats.missingCount} missing`} />
        </div>
      </div>

      {/* Checklist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {itemsWithStatus.map(({ req, matchedVendor, status }) => (
          <div
            key={req.id}
            className="p-4 rounded-xl border border-stone-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] hover:border-stone-300 dark:hover:border-white/[0.14] transition-colors space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-medium text-[#111113] dark:text-[#EDEDEF] leading-snug">
                  {req.roleTitle}
                </h4>
                <div className="text-[11px] text-stone-400 dark:text-zinc-500 capitalize mt-0.5">
                  {req.category} · {req.priority}
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
                    onClick={() => handleQuickSource(req)}
                    icon={<Plus />}
                  >
                    Source vendor
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

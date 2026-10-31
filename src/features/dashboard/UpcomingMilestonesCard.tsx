import React from 'react';
import { Card } from '../../components/ui/Card';
import { StatusDot } from '../../components/ui/StatusDot';
import { formatCurrency } from '../../utils/formatters';
import { Currency } from '../../types/event';
import { PaymentMilestone } from '../../types/budget';
import { ArrowRight } from 'lucide-react';

interface UpcomingMilestonesCardProps {
  milestones: PaymentMilestone[];
  currency: Currency;
  onViewAll: () => void;
}

const formatFriendlyDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const UpcomingMilestonesCard: React.FC<UpcomingMilestonesCardProps> = ({
  milestones,
  currency,
  onViewAll,
}) => {
  return (
    <Card className="col-span-12 lg:col-span-4 p-5 sm:p-6 space-y-4 rounded-xl border border-stone-200/80 dark:border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/[0.08] pb-3.5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[#111113] dark:text-[#EDEDEF]">
            Upcoming Milestones
          </h3>
          <p className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5">
            Next vendor tranche release deadlines
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>
      </div>

      <div className="space-y-2">
        {milestones.slice(0, 4).map((pm) => (
          <div
            key={pm.id}
            className="flex items-start justify-between p-3 rounded-lg border border-stone-200/80 dark:border-white/[0.08] bg-stone-50/30 dark:bg-white/[0.02] text-xs transition-colors hover:border-stone-300 dark:hover:border-white/[0.14] gap-3"
          >
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="font-medium text-[#111113] dark:text-[#EDEDEF] leading-snug truncate">
                {pm.title}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-[#8B8B93] truncate">
                {pm.vendorName}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-zinc-500 tabular-nums">
                Due {formatFriendlyDate(pm.dueDate)}
              </div>
            </div>

            <div className="text-right shrink-0 space-y-1">
              <div className="font-medium text-[#111113] dark:text-[#EDEDEF] text-xs tabular-nums">
                {formatCurrency(pm.amount, currency)}
              </div>
              <StatusDot
                status={pm.status === 'paid' ? 'green' : pm.status === 'overdue' ? 'red' : 'amber'}
                label={pm.status.charAt(0).toUpperCase() + pm.status.slice(1)}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

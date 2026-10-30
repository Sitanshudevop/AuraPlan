import React from 'react';
import { StatStrip, StatItem } from '../../components/ui/StatStrip';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Currency } from '../../types/event';

export interface DashboardStatTilesProps {
  targetBudget: number;
  totalPaid: number;
  perGuestCost: number;
  guestCount: number;
  signedVendors: number;
  totalVendors: number;
  vendorReadinessPct: number;
  taskCompletionPct: number;
  currency: Currency;
}

export const DashboardStatTiles: React.FC<DashboardStatTilesProps> = ({
  targetBudget,
  totalPaid,
  perGuestCost,
  guestCount,
  signedVendors,
  totalVendors,
  vendorReadinessPct,
  taskCompletionPct,
  currency,
}) => {
  const stats: StatItem[] = [
    {
      label: 'Target Budget',
      value: formatCurrency(targetBudget, currency),
      helper: (
        <span>
          Paid:{' '}
          <span className="font-medium text-stone-700 dark:text-[#EDEDEF] tabular-nums">
            {formatCurrency(totalPaid, currency)}
          </span>
        </span>
      ),
    },
    {
      label: 'Per-Guest Cost',
      value: formatCurrency(perGuestCost, currency),
      helper: (
        <span>
          Headcount:{' '}
          <span className="font-medium text-stone-700 dark:text-[#EDEDEF] tabular-nums">
            {guestCount} guests
          </span>
        </span>
      ),
    },
    {
      label: 'Vendor Contracts',
      value: `${signedVendors} / ${totalVendors}`,
      progress: vendorReadinessPct,
      helper: (
        <span>
          Contracted:{' '}
          <span className="font-medium text-stone-700 dark:text-[#EDEDEF] tabular-nums">
            {formatPercent(vendorReadinessPct)}
          </span>
        </span>
      ),
    },
    {
      label: 'Tasks Done',
      value: formatPercent(taskCompletionPct),
      progress: taskCompletionPct,
      helper: (
        <span>
          Schedule status:{' '}
          <span className="font-medium text-stone-700 dark:text-[#EDEDEF]">
            {taskCompletionPct >= 60 ? 'On schedule' : 'In progress'}
          </span>
        </span>
      ),
    },
  ];

  return <StatStrip stats={stats} />;
};

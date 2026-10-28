import React from 'react';
import { Card } from '../../components/ui/Card';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Currency } from '../../types/event';
import { WalletCards, Users, Briefcase, CheckCircle2 } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 sm:p-5 space-y-1.5 rounded-2xl border-stone-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            Target Budget
          </span>
          <WalletCards className="w-4 h-4 text-stone-400" />
        </div>
        <div className="text-xl font-mono font-bold text-[#18181B] dark:text-[#FAFAFA] tabular-nums">
          {formatCurrency(targetBudget, currency)}
        </div>
        <div className="text-[11px] text-stone-500 dark:text-zinc-400">
          Paid: <span className="font-mono tabular-nums font-semibold text-stone-700 dark:text-zinc-300">{formatCurrency(totalPaid, currency)}</span>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 space-y-1.5 rounded-2xl border-stone-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            Per-Guest Cost
          </span>
          <Users className="w-4 h-4 text-stone-400" />
        </div>
        <div className="text-xl font-mono font-bold text-[#18181B] dark:text-[#FAFAFA] tabular-nums">
          {formatCurrency(perGuestCost, currency)}
        </div>
        <div className="text-[11px] text-stone-500 dark:text-zinc-400">
          Headcount: <span className="font-mono tabular-nums font-semibold text-stone-700 dark:text-zinc-300">{guestCount} pax</span>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 space-y-2 rounded-2xl border-stone-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            Vendor Contracts
          </span>
          <Briefcase className="w-4 h-4 text-stone-400" />
        </div>
        <div className="text-xl font-mono font-bold text-[#18181B] dark:text-[#FAFAFA] tabular-nums">
          {signedVendors} / {totalVendors}
        </div>
        <div className="w-full bg-stone-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-amber-600 dark:bg-amber-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${vendorReadinessPct}%` }}
          />
        </div>
      </Card>

      <Card className="p-4 sm:p-5 space-y-2 rounded-2xl border-stone-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            Tasks Done
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {formatPercent(taskCompletionPct)}
        </div>
        <div className="w-full bg-stone-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${taskCompletionPct}%` }}
          />
        </div>
      </Card>
    </div>
  );
};


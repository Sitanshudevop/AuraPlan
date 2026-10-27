import React, { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatPercent, getDaysRemaining } from '../../utils/formatters';
import { AdaptiveWeddingWidget } from './AdaptiveWeddingWidget';
import { AdaptiveBirthdayWidget } from './AdaptiveBirthdayWidget';
import { AdaptiveCommunityWidget } from './AdaptiveCommunityWidget';
import {
  WalletCards,
  Users,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const DashboardTab: React.FC = () => {
  const { state, currency, setActiveTab } = useWorkspace();

  const metrics = useMemo(() => {
    const totalAllocated = state.budgetItems.reduce((acc, b) => acc + b.allocated, 0);
    const totalActual = state.budgetItems.reduce((acc, b) => acc + b.actualContracted, 0);
    const totalPaid = state.budgetItems.reduce((acc, b) => acc + b.amountPaid, 0);
    const perGuestCost = state.event.guestCount > 0 ? Math.round(state.event.targetBudget / state.event.guestCount) : 0;
    
    const signedVendors = state.vendors.filter((v) => v.status === 'contract_signed' || v.status === 'paid').length;
    const vendorReadinessPct = state.vendors.length > 0 ? Math.round((signedVendors / state.vendors.length) * 100) : 0;

    const completedTasks = state.macroTasks.filter((t) => t.completed).length;
    const taskCompletionPct = state.macroTasks.length > 0 ? Math.round((completedTasks / state.macroTasks.length) * 100) : 0;

    const isOverBudget = totalActual > state.event.targetBudget;

    return {
      totalAllocated,
      totalActual,
      totalPaid,
      perGuestCost,
      signedVendors,
      vendorReadinessPct,
      completedTasks,
      taskCompletionPct,
      isOverBudget,
    };
  }, [state]);

  const daysRemaining = getDaysRemaining(state.event.date);

  return (
    <div className="space-y-6">
      {/* Accessible View Heading for Screen Readers */}
      <h2 className="sr-only">Executive Bento Overview</h2>

      {/* Over Budget Alert Banner if applicable */}
      {metrics.isOverBudget && (
        <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-900 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Budget Variance Warning:</strong> Actual contracted commitments exceed target budget by{' '}
              <strong className="font-mono tabular-nums">
                {formatCurrency(metrics.totalActual - state.event.targetBudget, currency)}
              </strong>.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('budget')}
            className="underline font-semibold hover:text-rose-700"
          >
            Review Allocations →
          </button>
        </div>
      )}

      {/* 5 KPI Summary Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Budget Card */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Target Budget
            </span>
            <WalletCards className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-lg font-mono font-bold text-[#18181B] dark:text-[#FAFAFA] tabular-nums">
            {formatCurrency(state.event.targetBudget, currency)}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-zinc-400 truncate">
            Paid: <span className="font-mono tabular-nums font-semibold">{formatCurrency(metrics.totalPaid, currency)}</span>
          </div>
        </Card>

        {/* Per-Guest Metric */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Per-Guest Cost
            </span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-lg font-mono font-bold text-[#18181B] dark:text-[#FAFAFA] tabular-nums">
            {formatCurrency(metrics.perGuestCost, currency)}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-zinc-400 truncate">
            Headcount: <span className="font-mono tabular-nums font-semibold">{state.event.guestCount} pax</span>
          </div>
        </Card>

        {/* Days Countdown */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Countdown
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {daysRemaining} Days
          </div>
          <div className="text-[10px] text-stone-500 dark:text-zinc-400 truncate font-mono tabular-nums">
            {state.event.date}
          </div>
        </Card>

        {/* Vendor Readiness */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Vendor Contracts
            </span>
            <Briefcase className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-lg font-mono font-bold text-[#18181B] dark:text-[#FAFAFA] tabular-nums">
            {metrics.signedVendors} / {state.vendors.length}
          </div>
          <div className="w-full bg-stone-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${metrics.vendorReadinessPct}%` }}
            />
          </div>
        </Card>

        {/* Checklist Completion */}
        <Card className="p-4 space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Tasks Done
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatPercent(metrics.taskCompletionPct)}
          </div>
          <div className="w-full bg-stone-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-stone-900 dark:bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${metrics.taskCompletionPct}%` }}
            />
          </div>
        </Card>
      </div>

      {/* 12-Column Responsive Bento Main Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Adaptive Widget based on Event Mode */}
        {state.event.type === 'wedding' && <AdaptiveWeddingWidget />}
        {state.event.type === 'birthday' && <AdaptiveBirthdayWidget />}
        {state.event.type === 'community' && <AdaptiveCommunityWidget />}

        {/* Side Bento Card: Upcoming Payment Milestones */}
        <Card className="col-span-12 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#FAFAFA]">
                Upcoming Milestones & Deposits
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Scheduled vendor payment obligations
              </p>
            </div>
            <button
              onClick={() => setActiveTab('budget')}
              className="text-xs text-stone-600 dark:text-zinc-400 hover:text-stone-900 flex items-center gap-1 font-medium"
            >
              All →
            </button>
          </div>

          <div className="space-y-2.5">
            {state.paymentMilestones.slice(0, 4).map((pm) => (
              <div
                key={pm.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/40 text-xs"
              >
                <div>
                  <div className="font-semibold text-stone-900 dark:text-white truncate max-w-[180px]">
                    {pm.title}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-mono tabular-nums">
                    Due: {pm.dueDate} • {pm.vendorName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-stone-800 dark:text-zinc-200 tabular-nums">
                    {formatCurrency(pm.amount, currency)}
                  </div>
                  <Badge
                    variant={pm.status === 'paid' ? 'emerald' : pm.status === 'overdue' ? 'rose' : 'amber'}
                    size="sm"
                  >
                    {pm.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

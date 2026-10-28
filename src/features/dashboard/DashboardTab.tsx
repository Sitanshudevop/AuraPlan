import React, { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { WelcomeHero } from './WelcomeHero';
import { DashboardStatTiles } from './DashboardStatTiles';
import { AdaptiveWeddingWidget } from './AdaptiveWeddingWidget';
import { AdaptiveBirthdayWidget } from './AdaptiveBirthdayWidget';
import { AdaptiveCommunityWidget } from './AdaptiveCommunityWidget';
import { AlertTriangle, ArrowRight } from 'lucide-react';

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

  const formatFriendlyDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="sr-only">Executive Bento Overview</h2>

      {/* Warm Greeting Hero Moment */}
      <WelcomeHero
        taskCompletionPct={metrics.taskCompletionPct}
        signedVendors={metrics.signedVendors}
        totalVendors={state.vendors.length}
      />

      {/* Over Budget Alert Banner if applicable */}
      {metrics.isOverBudget && (
        <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs text-rose-900 dark:text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Budget Variance Alert:</strong> Contracted obligations exceed target by{' '}
              <strong className="font-mono tabular-nums">
                {formatCurrency(metrics.totalActual - state.event.targetBudget, currency)}
              </strong>.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('budget')}
            className="underline font-semibold hover:text-rose-700 text-xs shrink-0 ml-2"
          >
            Review Allocations →
          </button>
        </div>
      )}

      {/* 4 Focused Stat Tiles with generous spacing */}
      <DashboardStatTiles
        targetBudget={state.event.targetBudget}
        totalPaid={metrics.totalPaid}
        perGuestCost={metrics.perGuestCost}
        guestCount={state.event.guestCount}
        signedVendors={metrics.signedVendors}
        totalVendors={state.vendors.length}
        vendorReadinessPct={metrics.vendorReadinessPct}
        taskCompletionPct={metrics.taskCompletionPct}
        currency={currency}
      />

      {/* 12-Column Responsive Bento Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Adaptive Widget based on Event Mode */}
        {state.event.type === 'wedding' && <AdaptiveWeddingWidget />}
        {state.event.type === 'birthday' && <AdaptiveBirthdayWidget />}
        {state.event.type === 'community' && <AdaptiveCommunityWidget />}

        {/* Upcoming Payment Milestones Card */}
        <Card className="col-span-12 lg:col-span-5 p-5 sm:p-6 space-y-4 rounded-2xl border-stone-200 dark:border-zinc-800">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3.5">
            <div>
              <h3 className="text-base font-serif font-semibold text-[#18181B] dark:text-[#FAFAFA]">
                Upcoming Milestones
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Next vendor tranche release deadlines
              </p>
            </div>
            <button
              onClick={() => setActiveTab('budget')}
              className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium transition-colors"
            >
              <span>View all in Budget</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {state.paymentMilestones.slice(0, 3).map((pm) => (
              <div
                key={pm.id}
                className="flex items-start justify-between p-3.5 rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/40 text-xs transition-colors hover:border-amber-500/30 gap-3"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="font-semibold text-stone-900 dark:text-white leading-snug">
                    {pm.title}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-medium">
                    {pm.vendorName}
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-zinc-400 font-mono tabular-nums">
                    Due: {formatFriendlyDate(pm.dueDate)}
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <div className="font-mono font-bold text-stone-900 dark:text-white text-xs tabular-nums">
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

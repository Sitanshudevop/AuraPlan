import React, { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { StatusDot } from '../../components/ui/StatusDot';
import { formatCurrency } from '../../utils/formatters';
import { WelcomeHero } from './WelcomeHero';
import { DashboardStatTiles } from './DashboardStatTiles';
import { AdaptiveWeddingWidget } from './AdaptiveWeddingWidget';
import { AdaptiveBirthdayWidget } from './AdaptiveBirthdayWidget';
import { AdaptiveCommunityWidget } from './AdaptiveCommunityWidget';
import { ArrowRight } from 'lucide-react';

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
    <div className="space-y-8">
      <h2 className="sr-only">Executive Bento Overview</h2>

      {/* Greeting Header */}
      <WelcomeHero
        taskCompletionPct={metrics.taskCompletionPct}
        signedVendors={metrics.signedVendors}
        totalVendors={state.vendors.length}
      />

      {/* Over Budget Alert if applicable */}
      {metrics.isOverBudget && (
        <div className="flex items-center justify-between p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>
              <strong>Budget variance:</strong> Contracted obligations exceed target by{' '}
              <strong className="tabular-nums">
                {formatCurrency(metrics.totalActual - state.event.targetBudget, currency)}
              </strong>.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('budget')}
            className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline shrink-0 ml-2"
          >
            Review allocations →
          </button>
        </div>
      )}

      {/* Single Stats Strip with Thin Dividers */}
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

      {/* 2-Column Responsive Layout (8/4 Ratio) */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Modality Specific Itinerary / Experience Customizer */}
        {state.event.type === 'wedding' && <AdaptiveWeddingWidget />}
        {state.event.type === 'birthday' && <AdaptiveBirthdayWidget />}
        {state.event.type === 'community' && <AdaptiveCommunityWidget />}

        {/* Right Column (4 cols): Upcoming Payment Milestones Card */}
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
              onClick={() => setActiveTab('budget')}
              className="inline-flex items-center gap-1 text-xs text-[#6E79F5] hover:text-[#5D68E2] transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>

          <div className="space-y-2">
            {state.paymentMilestones.slice(0, 4).map((pm) => (
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
                  <div className="text-[11px] text-stone-400 dark:text-zinc-500 tabular-nums">
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
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatCurrency } from '../../utils/formatters';
import { WelcomeHero } from './WelcomeHero';
import { DashboardStatTiles } from './DashboardStatTiles';
import { AdaptiveWeddingWidget } from './AdaptiveWeddingWidget';
import { AdaptiveBirthdayWidget } from './AdaptiveBirthdayWidget';
import { AdaptiveCommunityWidget } from './AdaptiveCommunityWidget';
import { UpcomingMilestonesCard } from './UpcomingMilestonesCard';

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
        <UpcomingMilestonesCard
          milestones={state.paymentMilestones}
          currency={currency}
          onViewAll={() => setActiveTab('budget')}
        />
      </div>
    </div>
  );
};

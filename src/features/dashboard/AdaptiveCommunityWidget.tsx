import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';

export const AdaptiveCommunityWidget: React.FC = () => {
  const { state, currency } = useWorkspace();

  const totalSponsorship = state.sponsorships.reduce((sum, s) => sum + s.amount, 0);
  const netBudget = Math.max(0, state.event.targetBudget - totalSponsorship);

  return (
    <Card className="col-span-12 lg:col-span-8 space-y-4 rounded-xl border border-stone-200/80 dark:border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/[0.08] pb-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[#111113] dark:text-[#EDEDEF]">
            Sponsorship Inflow & Community Operations Matrix
          </h3>
          <p className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5">
            Sponsors dynamically offset gross budget expenses
          </p>
        </div>
        <span className="text-xs text-stone-400 dark:text-zinc-500">
          Community Experience
        </span>
      </div>

      {/* Sponsorship Offsetting Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50/50 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/[0.08] rounded-lg">
        <div>
          <span className="text-xs text-stone-500 dark:text-[#8B8B93]">Gross budget</span>
          <div className="text-sm font-semibold text-[#111113] dark:text-[#EDEDEF] tabular-nums mt-0.5">
            {formatCurrency(state.event.targetBudget, currency)}
          </div>
        </div>
        <div>
          <span className="text-xs text-stone-500 dark:text-[#8B8B93]">Sponsorship inflow</span>
          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
            +{formatCurrency(totalSponsorship, currency)}
          </div>
        </div>
        <div>
          <span className="text-xs text-stone-500 dark:text-[#8B8B93]">Net event outlay</span>
          <div className="text-sm font-semibold text-[#6E79F5] tabular-nums mt-0.5">
            {formatCurrency(netBudget, currency)}
          </div>
        </div>
      </div>

      {/* Sponsorship Tier Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-700 dark:text-[#EDEDEF]">
            Active Corporate Partners
          </span>
          <span className="text-xs text-stone-400 dark:text-zinc-500 tabular-nums">
            {state.sponsorships.length} partners confirmed
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {state.sponsorships.map((sponsor) => (
            <div
              key={sponsor.id}
              className="p-3 bg-stone-50/30 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/[0.08] rounded-lg space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <Badge variant={sponsor.tier === 'platinum' ? 'neutral' : 'amber'} size="sm">
                  {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}
                </Badge>
                <span className="text-xs font-semibold tabular-nums text-stone-800 dark:text-[#EDEDEF]">
                  {formatCurrency(sponsor.amount, currency)}
                </span>
              </div>
              <h4 className="text-xs font-medium text-[#111113] dark:text-[#EDEDEF] truncate">
                {sponsor.sponsorName}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-[#8B8B93] truncate">
                {sponsor.deliverablesSummary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Speaker Tracks & Volunteer Roster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3 bg-stone-50/30 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/[0.08] rounded-lg space-y-1">
          <div className="text-xs font-medium text-stone-700 dark:text-[#EDEDEF]">
            Parallel Tracks ({state.event.speakerTracks?.length || 3})
          </div>
          <ul className="text-xs text-stone-500 dark:text-[#8B8B93] space-y-0.5">
            {state.event.speakerTracks?.map((t, i) => (
              <li key={i} className="truncate">• {t}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-stone-50/30 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/[0.08] rounded-lg space-y-1">
          <div className="text-xs font-medium text-stone-700 dark:text-[#EDEDEF]">
            Volunteer Deployment (24 Volunteers)
          </div>
          <ul className="text-xs text-stone-500 dark:text-[#8B8B93] space-y-0.5">
            {state.event.volunteerRoles?.map((r, i) => (
              <li key={i} className="truncate">• {r}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

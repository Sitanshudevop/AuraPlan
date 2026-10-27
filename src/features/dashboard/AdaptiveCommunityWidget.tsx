import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Users, Mic } from 'lucide-react';

export const AdaptiveCommunityWidget: React.FC = () => {
  const { state, currency } = useWorkspace();

  const totalSponsorship = state.sponsorships.reduce((sum, s) => sum + s.amount, 0);
  const netBudget = Math.max(0, state.event.targetBudget - totalSponsorship);

  const getTierVariant = (tier: string) => {
    if (tier === 'platinum') return 'obsidian';
    if (tier === 'gold') return 'amber';
    return 'stone';
  };

  return (
    <Card className="col-span-12 lg:col-span-7 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#FAFAFA]">
            Sponsorship Inflow & Community Operations Matrix
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Sponsors dynamically offset gross budget expenses
          </p>
        </div>
        <Badge variant="emerald" size="sm">Community Mode</Badge>
      </div>

      {/* Sponsorship Offsetting Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400">Gross Budget</span>
          <div className="text-sm font-mono font-bold text-stone-900 dark:text-white tabular-nums">
            {formatCurrency(state.event.targetBudget, currency)}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400">Sponsorship Inflow</span>
          <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrency(totalSponsorship, currency)}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400">Net Event Outlay</span>
          <div className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {formatCurrency(netBudget, currency)}
          </div>
        </div>
      </div>

      {/* Sponsorship Tier Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            Active Corporate Partners
          </span>
          <span className="text-[11px] text-stone-400 font-mono tabular-nums">{state.sponsorships.length} Partners Confirmed</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {state.sponsorships.map((sponsor) => (
            <div
              key={sponsor.id}
              className="p-3 bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 rounded-lg space-y-1"
            >
              <div className="flex items-center justify-between">
                <Badge variant={getTierVariant(sponsor.tier)} size="sm">
                  {sponsor.tier.toUpperCase()}
                </Badge>
                <span className="text-[11px] font-mono font-bold text-stone-800 dark:text-zinc-200 tabular-nums">
                  {formatCurrency(sponsor.amount, currency)}
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                {sponsor.sponsorName}
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-zinc-400 truncate">
                {sponsor.deliverablesSummary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Speaker Tracks & Volunteer Roster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-3 bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-zinc-200 mb-2">
            <Mic className="w-3.5 h-3.5 text-indigo-600" />
            <span>Parallel Tracks ({state.event.speakerTracks?.length || 3})</span>
          </div>
          <ul className="text-xs text-stone-600 dark:text-zinc-400 space-y-1">
            {state.event.speakerTracks?.map((t, i) => (
              <li key={i} className="truncate">• {t}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-zinc-200 mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Volunteer Duty Deployment (24 Volunteers)</span>
          </div>
          <ul className="text-xs text-stone-600 dark:text-zinc-400 space-y-1">
            {state.event.volunteerRoles?.map((r, i) => (
              <li key={i} className="truncate">• {r}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

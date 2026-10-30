import React from 'react';
import { RippleDiffResult } from '../../types/ripple';
import { Currency } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';

interface RippleDiffSummaryProps {
  diffResult: RippleDiffResult;
  currency: Currency;
}

export const RippleDiffSummary: React.FC<RippleDiffSummaryProps> = ({
  diffResult,
  currency,
}) => {
  const totalImpacts =
    diffResult.budgetAdjustments.length +
    diffResult.newVendors.length +
    diffResult.timelineModifications.length;

  return (
    <div className="space-y-4 pt-3 border-t border-hairline">
      {/* Trigger */}
      <div className="p-3 bg-surface-raised rounded-lg border border-hairline space-y-1">
        <span className="text-xs text-muted uppercase font-medium">Scenario trigger</span>
        <div className="font-semibold text-foreground text-xs">{diffResult.scenarioTitle}</div>
        <p className="text-muted text-xs leading-relaxed">{diffResult.scenarioDescription}</p>
      </div>

      {/* Net impact */}
      <div className="p-3 bg-surface-raised rounded-lg border border-hairline flex items-center justify-between">
        <div>
          <span className="text-xs text-muted uppercase font-medium block">Net budget impact</span>
          <div className="text-lg font-semibold tabular-nums text-foreground mt-0.5">
            {diffResult.netBudgetImpact >= 0 ? '+' : ''}
            {formatCurrency(diffResult.netBudgetImpact, currency)}
          </div>
        </div>
        <Badge variant={diffResult.netBudgetImpact > 0 ? 'rose' : 'emerald'} size="sm">
          {diffResult.netBudgetImpact > 0 ? 'Budget increase' : 'Cost savings'}
        </Badge>
      </div>

      {/* Action items */}
      <div className="space-y-2">
        <span className="text-xs text-muted block font-medium">
          Impacted items ({totalImpacts})
        </span>
        <div className="space-y-1.5">
          {diffResult.budgetAdjustments.map((adj, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg border border-hairline bg-surface flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{adj.categoryLabel}</div>
                <div className="text-xs text-muted truncate">{adj.reason}</div>
              </div>
              <span
                className={`tabular-nums font-medium shrink-0 text-xs ${
                  adj.diff >= 0 ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                {adj.diff >= 0 ? '+' : ''}
                {formatCurrency(adj.diff, currency)}
              </span>
            </div>
          ))}
          {diffResult.newVendors.map((nv) => (
            <div
              key={nv.id}
              className="p-2.5 rounded-lg border border-hairline bg-surface flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{nv.name}</div>
                <div className="text-xs text-muted truncate">{nv.justification}</div>
              </div>
              <span className="tabular-nums font-medium text-muted shrink-0 text-xs">
                {formatCurrency(nv.estimatedCost, currency)}
              </span>
            </div>
          ))}
          {diffResult.timelineModifications.map((tm) => (
            <div
              key={tm.id}
              className="p-2.5 rounded-lg border border-hairline bg-surface space-y-0.5"
            >
              <div className="font-medium text-foreground flex items-center gap-1.5 truncate">
                <Badge variant="indigo" size="sm">{tm.action}</Badge>
                <span className="truncate">{tm.title}</span>
              </div>
              <div className="text-xs text-muted truncate">{tm.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

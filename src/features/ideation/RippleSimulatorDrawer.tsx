import React, { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { RipplePresetId, RippleDiffResult } from '../../types/ripple';
import { generateRippleScenario } from '../../services/geminiService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { logger } from '../../utils/logger';
import { useFocusTrap } from '../../hooks';
import { X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { PRESET_SCENARIOS } from './ripplePresetScenarios';

export const RippleSimulatorDrawer: React.FC = () => {
  const {
    isCopilotOpen,
    setCopilotOpen,
    state,
    currency,
    applyRipple,
    undoLastRipple,
    canUndo,
  } = useWorkspace();

  const [selectedPreset, setSelectedPreset] = useState<RipplePresetId>('guest_surge_25');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [diffResult, setDiffResult] = useState<RippleDiffResult | null>(null);

  const handleClose = useCallback(() => setCopilotOpen(false), [setCopilotOpen]);
  const drawerRef = useFocusTrap<HTMLDivElement>(isCopilotOpen, handleClose);

  const runSimulation = async (presetId: RipplePresetId) => {
    setSelectedPreset(presetId);
    setLoading(true);
    try {
      const res = await generateRippleScenario(
        presetId,
        state,
        presetId === 'custom' ? customPrompt : undefined
      );
      setDiffResult(res);
    } catch (err) {
      logger.error('Ripple simulation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (diffResult) {
      applyRipple(diffResult);
      setCopilotOpen(false);
    }
  };

  useEffect(() => {
    if (isCopilotOpen && !diffResult) {
      runSimulation('guest_surge_25');
    }
  }, [isCopilotOpen]);

  if (!isCopilotOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
      onClick={handleClose}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ripple-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#FAF9F6] dark:bg-[#111113] text-[#111113] dark:text-[#EDEDEF] border-l border-stone-200/80 dark:border-white/[0.08] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-150"
      >
        {/* Header */}
        <div className="h-14 px-5 border-b border-hairline flex items-center justify-between shrink-0">
          <div>
            <h3 id="ripple-drawer-title" className="font-semibold text-sm text-[#18181B] dark:text-[#EDEDEF]">
              Ripple simulator
            </h3>
            <p className="text-xs text-muted">Deterministic cross-module dependency engine</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted hover:text-foreground rounded-md transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
          <div>
            <span className="text-xs text-muted block mb-2 font-medium">
              Stress scenarios
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_SCENARIOS.map((p) => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => runSimulation(p.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-accent/10 border-accent text-foreground font-medium'
                        : 'border-hairline bg-surface-raised hover:bg-stone-200 dark:hover:bg-white/[0.04] text-muted'
                    }`}
                  >
                    <span className="shrink-0">{p.icon}</span>
                    <span className="truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Or custom prompt (e.g. surprise VIP arrival)..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted"
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={!customPrompt.trim()}
              onClick={() => runSimulation('custom')}
            >
              Simulate
            </Button>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <p className="text-xs text-muted tabular-nums">Calculating multi-module impacts...</p>
            </div>
          ) : diffResult ? (
            <div className="space-y-4 pt-3 border-t border-hairline">
              {/* Trigger */}
              <div className="p-3 bg-surface-raised rounded-lg border border-hairline space-y-1">
                <span className="text-[11px] text-muted uppercase font-medium">Scenario trigger</span>
                <div className="font-semibold text-foreground text-xs">{diffResult.scenarioTitle}</div>
                <p className="text-muted text-xs leading-relaxed">{diffResult.scenarioDescription}</p>
              </div>

              {/* Net impact */}
              <div className="p-3 bg-surface-raised rounded-lg border border-hairline flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted uppercase font-medium block">Net budget impact</span>
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
                  Impacted items ({diffResult.budgetAdjustments.length + diffResult.newVendors.length + diffResult.timelineModifications.length})
                </span>
                <div className="space-y-1.5">
                  {diffResult.budgetAdjustments.map((adj, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-hairline bg-surface flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{adj.categoryLabel}</div>
                        <div className="text-[11px] text-muted truncate">{adj.reason}</div>
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
                        <div className="text-[11px] text-muted truncate">{nv.justification}</div>
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
                      <div className="text-[11px] text-muted truncate">{tm.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="h-14 px-5 border-t border-hairline flex items-center justify-between gap-2 bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            {canUndo && (
              <Button variant="secondary" size="sm" onClick={undoLastRipple} icon={<RotateCcw className="w-3.5 h-3.5" />}>
                Undo
              </Button>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            disabled={!diffResult || loading}
            onClick={handleApply}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            Apply to plan
          </Button>
        </div>
      </div>
    </div>
  );
};

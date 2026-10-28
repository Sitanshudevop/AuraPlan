import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { RipplePresetId, RippleDiffResult } from '../../types/ripple';
import { generateRippleScenario } from '../../services/geminiService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { logger } from '../../utils/logger';
import { useFocusTrap } from '../../hooks';
import { Sparkles, X, RotateCcw, CheckCircle2, Loader2 } from 'lucide-react';
import { PRESET_SCENARIOS } from './ripplePresetScenarios';

export const RippleSimulatorDrawer: React.FC = () => {
  const {
    isCopilotOpen, setCopilotOpen, state, currency, applyRipple, undoLastRipple, canUndo,
  } = useWorkspace();

  const [selectedPreset, setSelectedPreset] = useState<RipplePresetId>('guest_surge_25');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [diffResult, setDiffResult] = useState<RippleDiffResult | null>(null);

  const drawerRef = useFocusTrap<HTMLDivElement>(isCopilotOpen, () => setCopilotOpen(false));

  const runSimulation = async (presetId: RipplePresetId) => {
    setSelectedPreset(presetId);
    setLoading(true);
    try {
      const res = await generateRippleScenario(presetId, state, presetId === 'custom' ? customPrompt : undefined);
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ripple-drawer-title"
        className="w-full max-w-[460px] bg-white dark:bg-[#121215] border-l border-stone-200 dark:border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Sticky Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 id="ripple-drawer-title" className="font-serif font-bold text-sm text-[#18181B] dark:text-[#FAFAFA]">
                "What-If" Ripple Simulator
              </h3>
              <p className="text-[11px] text-stone-600 dark:text-zinc-400">Deterministic cross-module dependency engine</p>
            </div>
          </div>
          <button
            onClick={() => setCopilotOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Middle Content */}
        <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto text-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 block mb-2">
              Select Stress Scenario
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_SCENARIOS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => runSimulation(p.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left font-medium transition-all ${
                    selectedPreset === p.id
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-200 shadow-xs'
                      : 'border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/60 text-stone-600 dark:text-zinc-400'
                  }`}
                >
                  {p.icon}
                  <span className="truncate text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Or type custom prompt (e.g. Celebrity guest arrival)..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl focus:outline-none dark:text-white"
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
              <Loader2 className="w-6 h-6 animate-spin text-amber-600 dark:text-amber-400" />
              <p className="font-mono text-stone-600 dark:text-zinc-400 text-[11px]">Calculating multi-module ripple dependencies...</p>
            </div>
          ) : diffResult ? (
            <div className="space-y-4 pt-3 border-t border-stone-100 dark:border-zinc-800">
              {/* 1) What Changes Headline */}
              <div className="p-3.5 bg-stone-50/80 dark:bg-zinc-900/60 rounded-xl border border-stone-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600 dark:text-zinc-400">Step 1: Scenario Trigger</span>
                <div className="font-serif font-bold text-sm text-stone-900 dark:text-white">{diffResult.scenarioTitle}</div>
                <p className="text-stone-600 dark:text-zinc-400 text-xs leading-relaxed">{diffResult.scenarioDescription}</p>
              </div>

              {/* 2) Net Budget Impact */}
              <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-400 block">Step 2: Net Budget Impact</span>
                  <div className="text-xl font-mono font-bold text-stone-900 dark:text-white mt-0.5 tabular-nums">
                    {diffResult.netBudgetImpact >= 0 ? '+' : ''}{formatCurrency(diffResult.netBudgetImpact, currency)}
                  </div>
                </div>
                <Badge variant={diffResult.netBudgetImpact > 0 ? 'rose' : 'emerald'} size="sm">
                  {diffResult.netBudgetImpact > 0 ? 'Budget Increase' : 'Savings'}
                </Badge>
              </div>

              {/* 3) Action Items Breakdown */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600 dark:text-zinc-400 block">
                  Step 3: Multi-Module Action Items ({diffResult.budgetAdjustments.length + diffResult.newVendors.length + diffResult.timelineModifications.length})
                </span>
                <div className="space-y-1.5">
                  {diffResult.budgetAdjustments.map((adj, i) => (
                    <div key={i} className="p-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 dark:text-white truncate">{adj.categoryLabel}</div>
                        <div className="text-[10px] text-stone-600 dark:text-zinc-400 truncate">{adj.reason}</div>
                      </div>
                      <div className="text-right font-mono font-bold tabular-nums shrink-0 text-xs">
                        <span className={adj.diff >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {adj.diff >= 0 ? '+' : ''}{formatCurrency(adj.diff, currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {diffResult.newVendors.map((nv) => (
                    <div key={nv.id} className="p-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 dark:text-white truncate">Vendor: {nv.name}</div>
                        <div className="text-[10px] text-stone-600 dark:text-zinc-400 truncate">{nv.justification}</div>
                      </div>
                      <div className="font-mono font-bold text-stone-800 dark:text-zinc-200 tabular-nums shrink-0 text-xs">
                        {formatCurrency(nv.estimatedCost, currency)}
                      </div>
                    </div>
                  ))}
                  {diffResult.timelineModifications.map((tm) => (
                    <div key={tm.id} className="p-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-0.5">
                      <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5 truncate">
                        <Badge variant="indigo" size="sm">{tm.action.toUpperCase()}</Badge>
                        <span className="truncate">{tm.title}</span>
                      </div>
                      <div className="text-[10px] text-stone-600 dark:text-zinc-400 truncate">{tm.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sticky Drawer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-2.5 bg-stone-50/80 dark:bg-[#121215] shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCopilotOpen(false)}>Cancel</Button>
            {canUndo && (
              <Button variant="outline" size="sm" onClick={undoLastRipple} icon={<RotateCcw className="w-3.5 h-3.5" />}>Undo</Button>
            )}
          </div>
          <Button variant="primary" size="sm" disabled={!diffResult || loading} onClick={handleApply} icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
            Apply Ripple to Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

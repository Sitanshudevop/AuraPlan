import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { RipplePresetId, RippleDiffResult } from '../../types/ripple';
import { generateRippleScenario } from '../../services/geminiService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import {
  Sparkles,
  X,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Loader2,
  CloudRain,
  Users,
  Percent,
} from 'lucide-react';

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

  const presets: { id: RipplePresetId; label: string; icon: React.ReactNode }[] = [
    { id: 'guest_surge_25', label: '+25% Guest Surge', icon: <Users className="w-3.5 h-3.5 text-indigo-500" /> },
    { id: 'cut_budget_15', label: '-15% Budget Cut', icon: <Percent className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'monsoon_warning', label: 'Monsoon Rain Alert', icon: <CloudRain className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'inflation_spike_20', label: '+20% Food Inflation', icon: <TrendingUp className="w-3.5 h-3.5 text-rose-500" /> },
  ];

  const runSimulation = async (presetId: RipplePresetId) => {
    setSelectedPreset(presetId);
    setLoading(true);
    try {
      const res = await generateRippleScenario(presetId, state, presetId === 'custom' ? customPrompt : undefined);
      setDiffResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCopilotOpen && !diffResult) {
      runSimulation('guest_surge_25');
    }
  }, [isCopilotOpen]);

  if (!isCopilotOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white dark:bg-[#121215] border-l border-stone-200/90 dark:border-zinc-800 h-full flex flex-col shadow-md animate-in slide-in-from-right duration-150">
        {/* Drawer Header */}
        <div className="p-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-[#18181B] dark:text-[#FAFAFA]">
              "What-If" Ripple Simulator
            </h3>
          </div>
          <button
            onClick={() => setCopilotOpen(false)}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-md"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
          {/* Preset Buttons */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 block mb-2">
              Select Stress Scenario
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => runSimulation(p.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left font-medium transition-colors ${
                    selectedPreset === p.id
                      ? 'bg-stone-100 dark:bg-zinc-800 border-stone-400 dark:border-zinc-600 text-stone-900 dark:text-white shadow-xs'
                      : 'border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-850 text-stone-600 dark:text-zinc-400'
                  }`}
                >
                  {p.icon}
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Scenario Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Or type custom prompt (e.g. Sudden celebrity guest arrival)..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none dark:text-white"
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

          {/* Simulation Diff Preview */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="font-mono text-stone-400 text-[11px]">
                Calculating multi-module ripple dependencies...
              </p>
            </div>
          ) : diffResult ? (
            <div className="space-y-4 pt-2 border-t border-stone-200 dark:border-zinc-800">
              {/* Scenario Summary */}
              <div className="p-3 bg-stone-50 dark:bg-zinc-900/60 rounded-lg border border-stone-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 dark:text-white">
                    {diffResult.scenarioTitle}
                  </span>
                  <Badge variant={diffResult.netBudgetImpact > 0 ? 'rose' : 'emerald'} size="sm">
                    {diffResult.netBudgetImpact >= 0 ? '+' : ''}
                    {formatCurrency(diffResult.netBudgetImpact, currency)} Net Impact
                  </Badge>
                </div>
                <p className="text-stone-600 dark:text-zinc-400 text-[11px]">
                  {diffResult.scenarioDescription}
                </p>
              </div>

              {/* Module 1: Budget Adjustments */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  1. Budget Mutations
                </span>
                <div className="space-y-1.5">
                  {diffResult.budgetAdjustments.map((adj, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-stone-900 dark:text-white">{adj.categoryLabel}</div>
                        <div className="text-[10px] text-stone-400">{adj.reason}</div>
                      </div>
                      <div className="text-right font-mono font-bold tabular-nums">
                        <span className={adj.diff >= 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {adj.diff >= 0 ? '+' : ''}{formatCurrency(adj.diff, currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module 2: Vendor Injections */}
              {diffResult.newVendors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    2. New Vendor Requirements
                  </span>
                  <div className="space-y-1.5">
                    {diffResult.newVendors.map((nv) => (
                      <div
                        key={nv.id}
                        className="p-2.5 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-stone-900 dark:text-white">{nv.name}</div>
                          <div className="text-[10px] text-stone-400">{nv.justification}</div>
                        </div>
                        <div className="font-mono font-bold text-stone-800 dark:text-zinc-200 tabular-nums">
                          {formatCurrency(nv.estimatedCost, currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Module 3: Timeline Tasks */}
              {diffResult.timelineModifications.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    3. Operational Tasks Injected
                  </span>
                  <div className="space-y-1.5">
                    {diffResult.timelineModifications.map((tm) => (
                      <div
                        key={tm.id}
                        className="p-2.5 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-0.5"
                      >
                        <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
                          <Badge variant="indigo" size="sm">{tm.action.toUpperCase()}</Badge>
                          <span>{tm.title}</span>
                        </div>
                        <div className="text-[10px] text-stone-400">{tm.detail} ({tm.horizonOrDayOf})</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Drawer Actions */}
        <div className="p-4 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between gap-2 bg-stone-50 dark:bg-[#121215]">
          <Button
            variant="outline"
            size="sm"
            disabled={!canUndo}
            onClick={undoLastRipple}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Undo Last Ripple
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={!diffResult || loading}
            onClick={() => {
              if (diffResult) {
                applyRipple(diffResult);
                setCopilotOpen(false);
              }
            }}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Apply Ripple to Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

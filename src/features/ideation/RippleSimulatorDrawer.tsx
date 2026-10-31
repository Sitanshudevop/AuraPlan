import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { RipplePresetId, RippleDiffResult } from '../../types/ripple';
import { generateRippleScenario } from '../../services/geminiService';
import { Button } from '../../components/ui/Button';
import { logger } from '../../utils/logger';
import { useFocusTrap } from '../../hooks';
import { X, RotateCcw, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { RippleDiffSummary } from './RippleDiffSummary';
import { RippleScenarioSelector } from './RippleScenarioSelector';

export const RippleSimulatorDrawer: React.FC = () => {
  const { isCopilotOpen, setCopilotOpen, state, currency, applyRipple, undoLastRipple, canUndo } = useWorkspace();

  const [selectedPreset, setSelectedPreset] = useState<RipplePresetId>('guest_surge_25');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<RippleDiffResult | null>(null);

  const reqIdRef = useRef(0);
  const handleClose = useCallback(() => setCopilotOpen(false), [setCopilotOpen]);
  const drawerRef = useFocusTrap<HTMLDivElement>(isCopilotOpen, handleClose);

  const runSimulation = useCallback(
    async (presetId: RipplePresetId) => {
      setSelectedPreset(presetId);
      const currentReq = ++reqIdRef.current;
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await generateRippleScenario(
          presetId,
          state,
          presetId === 'custom' ? customPrompt : undefined
        );
        if (currentReq !== reqIdRef.current) return;
        setDiffResult(res);
      } catch (err) {
        if (currentReq !== reqIdRef.current) return;
        logger.error('Ripple simulation failed', err);
        setErrorMsg('Ripple simulation encountered an issue. Please try again.');
      } finally {
        if (currentReq === reqIdRef.current) {
          setLoading(false);
        }
      }
    },
    [state, customPrompt]
  );

  const handleApply = () => {
    if (diffResult) {
      applyRipple(diffResult);
      setCopilotOpen(false);
    }
  };

  useEffect(() => {
    if (isCopilotOpen && !diffResult && !loading) {
      runSimulation('guest_surge_25');
    }
  }, [isCopilotOpen, diffResult, loading, runSimulation]);

  useEffect(() => {
    if (!isCopilotOpen) {
      reqIdRef.current++;
    }
  }, [isCopilotOpen]);

  if (!isCopilotOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-black/80 backdrop-blur-md flex justify-end"
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
            className="p-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-muted hover:text-foreground rounded-md transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
          <RippleScenarioSelector
            selectedPreset={selectedPreset}
            onSelectPreset={runSimulation}
            customPrompt={customPrompt}
            onCustomPromptChange={setCustomPrompt}
            onSimulateCustom={() => runSimulation('custom')}
          />

          {loading ? (
            <div
              role="status"
              aria-busy="true"
              aria-live="polite"
              className="py-16 flex flex-col items-center justify-center space-y-3"
            >
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <p className="text-xs text-muted tabular-nums">Calculating multi-module impacts...</p>
            </div>
          ) : errorMsg ? (
            <div
              role="alert"
              className="p-4 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-3 my-4"
            >
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-medium text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => runSimulation(selectedPreset)}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Try again
              </Button>
            </div>
          ) : diffResult ? (
            <RippleDiffSummary diffResult={diffResult} currency={currency} />
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

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

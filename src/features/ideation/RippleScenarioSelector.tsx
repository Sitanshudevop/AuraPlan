import React from 'react';
import { RipplePresetId } from '../../types/ripple';
import { Button } from '../../components/ui/Button';
import { PRESET_SCENARIOS } from './ripplePresetScenarios';

interface RippleScenarioSelectorProps {
  selectedPreset: RipplePresetId;
  onSelectPreset: (id: RipplePresetId) => void;
  customPrompt: string;
  onCustomPromptChange: (val: string) => void;
  onSimulateCustom: () => void;
}

export const RippleScenarioSelector: React.FC<RippleScenarioSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  customPrompt,
  onCustomPromptChange,
  onSimulateCustom,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <span className="text-xs text-muted block mb-2 font-medium">Stress scenarios</span>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_SCENARIOS.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPreset(p.id)}
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
          onChange={(e) => onCustomPromptChange(e.target.value)}
          className="flex-1 text-xs px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted"
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={!customPrompt.trim()}
          onClick={onSimulateCustom}
        >
          Simulate
        </Button>
      </div>
    </div>
  );
};

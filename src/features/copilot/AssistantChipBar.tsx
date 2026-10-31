import React from 'react';
import { Key } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface AssistantChipBarProps {
  showKeyInput: boolean;
  customKey: string;
  setCustomKey: (val: string) => void;
  handleSaveKey: () => void;
  handleClearKey: () => void;
  hasKey: boolean;
  quickChips: string[];
  onSelectChip: (chip: string) => void;
}

export const AssistantChipBar: React.FC<AssistantChipBarProps> = ({
  showKeyInput,
  customKey,
  setCustomKey,
  handleSaveKey,
  handleClearKey,
  hasKey,
  quickChips,
  onSelectChip,
}) => {
  return (
    <>
      {showKeyInput && (
        <div className="p-3 bg-stone-100/80 dark:bg-[#161618] border-b border-stone-200/80 dark:border-white/[0.08] flex items-center gap-2 text-xs">
          <Key className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <input
            type="password"
            placeholder="Paste Gemini API key..."
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            className="flex-1 text-xs px-2.5 py-1.5 bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-white/[0.08] rounded-md text-[#111113] dark:text-[#EDEDEF] focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Button size="sm" variant="primary" onClick={handleSaveKey} disabled={!customKey.trim()}>
            Save
          </Button>
          {hasKey && (
            <Button size="sm" variant="ghost" onClick={handleClearKey}>
              Reset
            </Button>
          )}
        </div>
      )}

      <div className="p-4 border-b border-stone-200/80 dark:border-white/[0.08] bg-stone-50/50 dark:bg-white/[0.01] space-y-2 shrink-0">
        <span className="text-xs font-medium text-stone-500 dark:text-[#8B8B93] block">Suggested prompts</span>
        <div className="flex flex-wrap gap-1.5">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onSelectChip(chip)}
              className="text-xs px-2.5 py-1 bg-white dark:bg-white/[0.04] hover:bg-stone-100 dark:hover:bg-white/[0.08] border border-stone-200/80 dark:border-white/[0.08] rounded-md text-stone-800 dark:text-[#EDEDEF] transition-colors text-left shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};


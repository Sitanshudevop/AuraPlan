import React from 'react';

interface AssistantChipBarProps {
  quickChips: string[];
  onSelectChip: (chip: string) => void;
}

export const AssistantChipBar: React.FC<AssistantChipBarProps> = ({
  quickChips,
  onSelectChip,
}) => {
  return (
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
  );
};

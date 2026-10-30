import React from 'react';
import { DecorConcept } from '../../types/ideation';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Check, Plus } from 'lucide-react';

interface ThemeDecorTabProps {
  decorConcepts: DecorConcept[];
  currency: Currency;
  addedIds: Set<string>;
  onAdd: (
    id: string,
    title: string,
    cost: number,
    category: 'decor' | 'av_photo' | 'venue' | 'catering',
    task: string
  ) => void;
}

export const ThemeDecorTab: React.FC<ThemeDecorTabProps> = ({
  decorConcepts,
  currency,
  addedIds,
  onAdd,
}) => {
  return (
    <div className="space-y-2.5 pt-1">
      {decorConcepts.map((dc) => {
        const isAdded = addedIds.has(dc.id);
        return (
          <div
            key={dc.id}
            className="flex items-center justify-between p-3.5 rounded-lg border border-stone-200/80 dark:border-white/[0.08] bg-stone-50/30 dark:bg-white/[0.02] text-xs gap-3"
          >
            <div className="pr-2 min-w-0 flex-1">
              <div className="font-medium text-[#111113] dark:text-[#EDEDEF]">{dc.title}</div>
              <p className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5 leading-relaxed">{dc.description}</p>
              <div className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1">Milestone: {dc.timelineTask}</div>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <div className="font-semibold text-[#111113] dark:text-[#EDEDEF] tabular-nums">
                {formatCurrency(dc.estimatedCost, currency)}
              </div>
              <Button
                variant={isAdded ? 'secondary' : 'outline'}
                size="xs"
                disabled={isAdded}
                onClick={() => onAdd(dc.id, dc.title, dc.estimatedCost, dc.category, dc.timelineTask)}
                icon={isAdded ? <Check className="w-3 h-3 text-emerald-500" /> : <Plus className="w-3 h-3" />}
              >
                {isAdded ? 'Added' : 'Add to plan'}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

import React, { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Guest, DietaryTag } from '../../types/guest';
import { Card } from '../../components/ui/Card';
import { dynamicWidthStyle } from '../../utils/styleHelpers';

interface DietarySummaryBarProps {
  guests: Guest[];
}

const dietaryColors: Record<DietaryTag, string> = {
  regular: 'bg-stone-400 dark:bg-stone-500',
  vegetarian: 'bg-emerald-500',
  jain: 'bg-amber-500',
  vegan: 'bg-teal-500',
  gluten_free: 'bg-indigo-500',
  nut_free: 'bg-rose-500',
};

const dietaryLabels: Record<DietaryTag, string> = {
  regular: 'Regular',
  vegetarian: 'Vegetarian',
  jain: 'Jain',
  vegan: 'Vegan',
  gluten_free: 'Gluten-free',
  nut_free: 'Nut-free',
};

export const DietarySummaryBar: React.FC<DietarySummaryBarProps> = ({ guests }) => {
  const { state } = useWorkspace();

  const { counts, totalSampled } = useMemo(() => {
    const res: Record<DietaryTag, number> = {
      regular: 0,
      vegetarian: 0,
      jain: 0,
      vegan: 0,
      gluten_free: 0,
      nut_free: 0,
    };

    let total = 0;
    guests.forEach((g) => {
      const covers = 1 + (g.plusOnes || 0);
      res[g.dietary] = (res[g.dietary] || 0) + covers;
      total += covers;
    });

    return { counts: res, totalSampled: total };
  }, [guests]);

  const activeDietary = (Object.keys(counts) as DietaryTag[]).filter((t) => counts[t] > 0);
  const totalExpected = state.event.guestCount;

  return (
    <Card className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-foreground">Automatic Catering Sync: Live Dietary Breakdown</span>
          <span className="text-muted ml-2">
            {totalSampled} of {totalExpected} guests recorded
          </span>
        </div>
        <span className="text-xs text-muted tabular-nums">
          {totalSampled > 0 ? `${Math.round((totalSampled / totalExpected) * 100)}% sampled` : '0%'}
        </span>
      </div>

      {/* Segmented bar */}
      <div className="w-full h-2 bg-stone-200 dark:bg-white/[0.08] rounded-full overflow-hidden flex">
        {activeDietary.map((tag) => {
          const count = counts[tag];
          const pct = totalSampled > 0 ? (count / totalSampled) * 100 : 0;
          return (
            <div
              key={tag}
              style={dynamicWidthStyle(pct)}
              className={`${dietaryColors[tag]} h-full transition-all duration-150`}
              title={`${dietaryLabels[tag]}: ${count} (${pct.toFixed(0)}%)`}
            />
          );
        })}
      </div>

      {/* Legend with counts */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs">
        {activeDietary.map((tag) => {
          const count = counts[tag];
          const pct = totalSampled > 0 ? Math.round((count / totalSampled) * 100) : 0;
          return (
            <div key={tag} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dietaryColors[tag]}`} />
              <span className="text-muted">{dietaryLabels[tag]}</span>
              <span className="font-medium tabular-nums text-foreground">{count}</span>
              <span className="text-[11px] text-muted tabular-nums">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

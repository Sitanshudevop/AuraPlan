import React, { useMemo } from 'react';
import { Guest, DietaryTag } from '../../types/guest';
import { Card } from '../../components/ui/Card';
import { Utensils } from 'lucide-react';

interface DietarySummaryBarProps {
  guests: Guest[];
}

const dietaryColors: Record<DietaryTag, string> = {
  regular: 'bg-stone-500',
  vegetarian: 'bg-emerald-500',
  jain: 'bg-amber-500',
  vegan: 'bg-teal-500',
  gluten_free: 'bg-indigo-500',
  nut_free: 'bg-rose-500',
};

const dietaryLabels: Record<DietaryTag, string> = {
  regular: 'Regular / Non-Veg',
  vegetarian: 'Pure Vegetarian',
  jain: 'Strict Jain (No Root Veg)',
  vegan: 'Plant-Based Vegan',
  gluten_free: 'Gluten-Free',
  nut_free: 'Nut-Free / Allergy Safe',
};

export const DietarySummaryBar: React.FC<DietarySummaryBarProps> = ({ guests }) => {
  const dietaryCounts = useMemo(() => {
    const counts: Record<DietaryTag, number> = {
      regular: 0,
      vegetarian: 0,
      jain: 0,
      vegan: 0,
      gluten_free: 0,
      nut_free: 0,
    };

    guests.forEach((g) => {
      const totalPax = 1 + (g.plusOnes || 0);
      counts[g.dietary] = (counts[g.dietary] || 0) + totalPax;
    });

    return counts;
  }, [guests]);

  const totalHeadcount = Object.values(dietaryCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-zinc-200">
          <Utensils className="w-4 h-4 text-emerald-600" />
          <span>Automatic Catering Sync: Live Dietary Breakdown</span>
        </div>
        <span className="text-[11px] font-mono font-medium text-stone-500">
          {totalHeadcount} Total Covers Tracked
        </span>
      </div>

      {/* Multi-Segment Stacked Progress Bar */}
      <div className="w-full h-3 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
        {(Object.keys(dietaryCounts) as DietaryTag[]).map((tag) => {
          const count = dietaryCounts[tag];
          if (count === 0) return null;
          const pct = (count / totalHeadcount) * 100;
          return (
            <div
              key={tag}
              style={{ width: `${pct}%` }}
              className={`${dietaryColors[tag]} h-full transition-all duration-300`}
              title={`${dietaryLabels[tag]}: ${count} pax (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Breakdown Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-xs">
        {(Object.keys(dietaryCounts) as DietaryTag[]).map((tag) => {
          const count = dietaryCounts[tag];
          const pct = ((count / totalHeadcount) * 100).toFixed(0);
          return (
            <div
              key={tag}
              className="p-2 rounded bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${dietaryColors[tag]}`} />
                <span className="text-[10px] font-bold text-stone-700 dark:text-zinc-300 truncate">
                  {dietaryLabels[tag].split(' ')[0]}
                </span>
              </div>
              <div className="font-mono font-bold text-stone-900 dark:text-white text-xs tabular-nums">
                {count} pax <span className="text-[10px] text-stone-400 font-normal">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

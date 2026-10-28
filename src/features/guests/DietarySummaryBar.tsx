import React, { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
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

const dietaryShortLabels: Record<DietaryTag, string> = {
  regular: 'Regular',
  vegetarian: 'Vegetarian',
  jain: 'Jain',
  vegan: 'Vegan',
  gluten_free: 'Gluten-Free',
  nut_free: 'Nut-Free',
};

export const DietarySummaryBar: React.FC<DietarySummaryBarProps> = ({ guests }) => {
  const { state } = useWorkspace();

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

  const sampledCovers = Object.values(dietaryCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <Card className="space-y-4 p-5 sm:p-6 rounded-2xl border-stone-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-zinc-200">
          <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Automatic Catering Sync: Live Dietary Breakdown</span>
        </div>
        <span className="text-[11px] font-mono text-stone-500 dark:text-zinc-400">
          <strong className="text-stone-800 dark:text-zinc-200">{sampledCovers} RSVPs Sampled</strong> • {state.event.guestCount} Total Expected Guests
        </span>
      </div>

      {/* Multi-Segment Stacked Progress Bar */}
      <div className="w-full h-3 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
        {(Object.keys(dietaryCounts) as DietaryTag[]).map((tag) => {
          const count = dietaryCounts[tag];
          if (count === 0) return null;
          const pct = (count / sampledCovers) * 100;
          return (
            <div
              key={tag}
              style={{ width: `${pct}%` }}
              className={`${dietaryColors[tag]} h-full transition-all duration-300`}
              title={`${dietaryLabels[tag]}: ${count} covers (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Breakdown Pills with Full Clean Labels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 text-xs">
        {(Object.keys(dietaryCounts) as DietaryTag[]).map((tag) => {
          const count = dietaryCounts[tag];
          const pct = ((count / sampledCovers) * 100).toFixed(0);
          return (
            <div
              key={tag}
              className="p-2.5 rounded-xl bg-stone-50/70 dark:bg-zinc-900/60 border border-stone-200/80 dark:border-zinc-800 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${dietaryColors[tag]}`} />
                <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                  {dietaryShortLabels[tag]}
                </span>
              </div>
              <div className="font-mono font-bold text-stone-900 dark:text-white text-xs tabular-nums">
                {count} pax <span className="text-[10px] text-stone-600 dark:text-zinc-400 font-normal">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

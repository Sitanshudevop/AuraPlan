import React from 'react';
import { ZoneCapacity } from '../../types/guest';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LayoutGrid } from 'lucide-react';

interface ZoneCapacityMetersProps {
  zones: ZoneCapacity[];
}

export const ZoneCapacityMeters: React.FC<ZoneCapacityMetersProps> = ({ zones }) => {
  return (
    <Card className="space-y-4 p-5 sm:p-6 rounded-2xl border-stone-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-zinc-200">
          <LayoutGrid className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Interactive Zone & Table Capacity Matrix</span>
        </div>
        <span className="text-[11px] font-mono text-stone-500 dark:text-zinc-400">
          {zones.length} Managed Enclosures
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map((zone) => {
          const isOver = zone.assignedCount > zone.maxCapacity;
          const pct = Math.min(100, Math.round((zone.assignedCount / zone.maxCapacity) * 100));

          return (
            <div
              key={zone.id}
              className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                isOver
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                  : 'bg-stone-50/60 dark:bg-zinc-900/60 border-stone-200/80 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-semibold text-stone-900 dark:text-white min-w-0 flex-1 leading-snug">
                  {zone.name}
                </h4>
                {isOver ? (
                  <Badge variant="rose" size="sm" className="shrink-0 whitespace-nowrap">
                    Over-Capacity
                  </Badge>
                ) : (
                  <Badge variant="stone" size="sm" className="shrink-0 whitespace-nowrap font-mono tabular-nums">
                    {pct}% Full
                  </Badge>
                )}
              </div>

              {/* Capacity Bar */}
              <div className="w-full h-2 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver ? 'bg-rose-600' : pct > 85 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-zinc-400 tabular-nums">
                <span>{zone.assignedCount} Assigned</span>
                <span>Max: {zone.maxCapacity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

import React from 'react';
import { ZoneCapacity } from '../../types/guest';
import { Card } from '../../components/ui/Card';
import { StatusDot } from '../../components/ui/StatusDot';
import { dynamicWidthStyle } from '../../utils/styleHelpers';

interface ZoneCapacityMetersProps {
  zones: ZoneCapacity[];
}

export const ZoneCapacityMeters: React.FC<ZoneCapacityMetersProps> = ({ zones }) => {
  return (
    <Card className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">Interactive Zone & Table Capacity Matrix</span>
        <span className="text-muted tabular-nums">{zones.length} active zones</span>
      </div>

      <div className="space-y-3 pt-1">
        {zones.map((zone) => {
          const isOver = zone.assignedCount > zone.maxCapacity;
          const pct = Math.min(100, Math.round((zone.assignedCount / zone.maxCapacity) * 100));

          return (
            <div key={zone.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-foreground truncate">{zone.name}</span>
                  {isOver && (
                    <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1 shrink-0">
                      <StatusDot status="conflict" /> Over-capacity
                    </span>
                  )}
                </div>
                <div className="text-muted tabular-nums text-xs shrink-0 pl-2">
                  <span className="text-foreground font-medium">{zone.assignedCount}</span>
                  <span> / {zone.maxCapacity}</span>
                  <span className="text-[11px] text-muted ml-1.5">({pct}%)</span>
                </div>
              </div>

              {/* Slim progress bar (4px) */}
              <div className="w-full h-1.5 bg-stone-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    isOver ? 'bg-rose-500' : pct > 85 ? 'bg-amber-500' : 'bg-accent'
                  }`}
                  style={dynamicWidthStyle(pct)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

import React from 'react';
import { ScheduleConflict } from '../../types/timeline';
import { Button } from '../../components/ui/Button';
import { RotateCw } from 'lucide-react';

interface ConflictAlertBannerProps {
  conflicts: ScheduleConflict[];
  onShiftActivity: (activityId: string) => void;
}

export const ConflictAlertBanner: React.FC<ConflictAlertBannerProps> = ({
  conflicts,
  onShiftActivity,
}) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2 text-xs">
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
        <span>
          {conflicts.length} overlapping schedule conflict{conflicts.length > 1 ? 's' : ''} detected
        </span>
      </div>

      <div className="space-y-2">
        {conflicts.map((conflict, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white/70 dark:bg-white/[0.04] rounded-lg border border-red-500/15 text-xs"
          >
            <div>
              <span className="font-medium text-red-700 dark:text-red-300">
                "{conflict.activity1.title}" & "{conflict.activity2.title}"
              </span>
              <p className="text-red-600/90 dark:text-red-400/90 text-[11px] mt-0.5">
                {conflict.conflictDetail}
              </p>
            </div>

            <Button
              variant="danger"
              size="xs"
              onClick={() => onShiftActivity(conflict.activity2.id)}
              icon={<RotateCw />}
            >
              Auto-resolve shift (+30m)
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};


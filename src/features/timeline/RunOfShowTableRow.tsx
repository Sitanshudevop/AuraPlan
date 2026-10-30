import React from 'react';
import { DayOfActivity } from '../../types/timeline';
import { Button } from '../../components/ui/Button';
import { Trash2 } from 'lucide-react';

interface RunOfShowTableRowProps {
  activity: DayOfActivity;
  hasConflict: boolean;
  onShiftActivity: (id: string) => void;
  onDeleteActivity: (id: string) => void;
}

export const RunOfShowTableRow: React.FC<RunOfShowTableRowProps> = ({
  activity,
  hasConflict,
  onShiftActivity,
  onDeleteActivity,
}) => {
  return (
    <tr
      className={`h-14 transition-colors ${
        hasConflict
          ? 'bg-red-500/[0.06] dark:bg-red-500/[0.08]'
          : 'hover:bg-stone-50/60 dark:hover:bg-white/[0.02]'
      }`}
    >
      <td className="py-3 px-4 tabular-nums text-[#111113] dark:text-[#EDEDEF]">
        <div className="font-medium">
          {activity.startTime} – {activity.endTime}
        </div>
        <span className="text-[11px] text-stone-400 dark:text-zinc-500">
          {activity.durationMinutes}m window
        </span>
      </td>

      <td className="py-3 px-4">
        <div className="font-medium text-[#111113] dark:text-[#EDEDEF]">{activity.title}</div>
        {activity.notes && (
          <div className="text-[11px] text-stone-400 dark:text-zinc-500 truncate max-w-sm">
            {activity.notes}
          </div>
        )}
      </td>

      <td className="py-3 px-4 text-stone-600 dark:text-[#8B8B93]">
        <span>{activity.locationZone}</span>
      </td>

      <td className="py-3 px-4 text-stone-600 dark:text-[#8B8B93]">
        <span>{activity.poc}</span>
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {hasConflict && (
            <Button
              variant="danger"
              size="xs"
              onClick={() => onShiftActivity(activity.id)}
              title="Shift activity by 30 mins to resolve overlap"
            >
              Shift +30m
            </Button>
          )}
          <button
            type="button"
            onClick={() => onDeleteActivity(activity.id)}
            className="p-1 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label={`Delete activity ${activity.title}`}
            title="Delete activity"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </td>
    </tr>
  );
};

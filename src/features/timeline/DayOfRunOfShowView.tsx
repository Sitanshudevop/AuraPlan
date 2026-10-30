import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AddActivityModal } from './AddActivityModal';
import { detectScheduleConflicts, sortActivitiesChronologically } from './ConflictDetector';
import {
  Clock,
  MapPin,
  User,
  AlertTriangle,
  RotateCw,
  Plus,
  Trash2,
} from 'lucide-react';

export const DayOfRunOfShowView: React.FC = () => {
  const { state, shiftActivity30m, addDayOfActivity, deleteDayOfActivity } = useWorkspace();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const sortedActivities = useMemo(() => {
    return sortActivitiesChronologically(state.dayOfActivities);
  }, [state.dayOfActivities]);

  const conflicts = useMemo(() => {
    return detectScheduleConflicts(sortedActivities);
  }, [sortedActivities]);

  // Set of activity IDs involved in any conflict
  const conflictedActivityIds = useMemo(() => {
    const ids = new Set<string>();
    conflicts.forEach((c) => {
      ids.add(c.activity1.id);
      ids.add(c.activity2.id);
    });
    return ids;
  }, [conflicts]);

  return (
    <div className="space-y-6">
      {/* Schedule Conflict Warning Banner */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {conflicts.length} Overlapping Schedule Conflict{conflicts.length > 1 ? 's' : ''} Detected!
            </span>
          </div>

          <div className="space-y-2">
            {conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white/80 dark:bg-zinc-900/80 rounded border border-rose-200 dark:border-rose-800/60 text-xs"
              >
                <div>
                  <span className="font-semibold text-rose-900 dark:text-rose-300">
                    "{conflict.activity1.title}" & "{conflict.activity2.title}"
                  </span>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                    {conflict.conflictDetail}
                  </p>
                </div>

                <Button
                  variant="danger"
                  size="xs"
                  onClick={() => shiftActivity30m(conflict.activity2.id)}
                  icon={<RotateCw className="w-3 h-3" />}
                >
                  Auto-Resolve Shift (+30m)
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chronological Table of Activities */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#FAFAFA]">
              Minute-by-Minute Run-of-Show
            </h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              Synchronized cues for coordinators, vendors, and production crew
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tabular-nums text-stone-400">
              {sortedActivities.length} Scheduled Events
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Activity
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-50 dark:bg-zinc-900/60 border-b border-stone-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              <tr>
                <th className="py-2.5 px-3 w-36 font-mono">Window</th>
                <th className="py-2.5 px-3">Activity Title</th>
                <th className="py-2.5 px-3">Location / Zone</th>
                <th className="py-2.5 px-3">Point of Contact</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/60">
              {sortedActivities.map((act) => {
                const hasConflict = conflictedActivityIds.has(act.id);
                return (
                  <tr
                    key={act.id}
                    className={`transition-colors ${
                      hasConflict
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-rose-500'
                        : 'hover:bg-stone-50/50 dark:hover:bg-zinc-900/30'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-stone-900 dark:text-white tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{act.startTime} - {act.endTime}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-normal ml-5 font-mono tabular-nums">
                        ({act.durationMinutes}m)
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900 dark:text-white">
                        {act.title}
                      </div>
                      {act.notes && (
                        <div className="text-[10px] text-stone-500 dark:text-zinc-400">
                          {act.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-stone-600 dark:text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{act.locationZone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-stone-600 dark:text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{act.poc}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasConflict && (
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={() => shiftActivity30m(act.id)}
                            title="Shift activity by 30 mins to resolve overlap"
                          >
                            Shift +30m
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteDayOfActivity(act.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                          aria-label={`Delete activity ${act.title}`}
                          title="Delete activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Day-Of Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddActivity={addDayOfActivity}
      />
    </div>
  );
};

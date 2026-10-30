import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Button } from '../../components/ui/Button';
import { AddActivityModal } from './AddActivityModal';
import { detectScheduleConflicts, sortActivitiesChronologically } from './ConflictDetector';
import { RotateCw, Plus, Trash2 } from 'lucide-react';

export const DayOfRunOfShowView: React.FC = () => {
  const { state, shiftActivity30m, addDayOfActivity, deleteDayOfActivity } = useWorkspace();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const sortedActivities = useMemo(() => {
    return sortActivitiesChronologically(state.dayOfActivities);
  }, [state.dayOfActivities]);

  const conflicts = useMemo(() => {
    return detectScheduleConflicts(sortedActivities);
  }, [sortedActivities]);

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
      {/* Schedule Conflict Alert Banner */}
      {conflicts.length > 0 && (
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
                  onClick={() => shiftActivity30m(conflict.activity2.id)}
                  icon={<RotateCw />}
                >
                  Auto-resolve shift (+30m)
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chronological Table of Activities */}
      <div className="border border-stone-200/80 dark:border-white/[0.08] rounded-xl overflow-hidden bg-white dark:bg-[#111113]">
        <div className="p-4 border-b border-stone-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-[#111113] dark:text-[#EDEDEF]">
              Minute-by-minute run-of-show
            </h3>
            <p className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5">
              Synchronized cues for coordinators and production crew
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums text-stone-400 dark:text-zinc-500">
              {sortedActivities.length} scheduled events
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              icon={<Plus />}
            >
              Add activity
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-50/80 dark:bg-white/[0.02] border-b border-stone-200/80 dark:border-white/[0.08] text-xs font-normal text-stone-500 dark:text-[#8B8B93] sticky top-0">
              <tr>
                <th className="py-3 px-4 w-40 font-normal">Time window</th>
                <th className="py-3 px-4 font-normal">Activity title</th>
                <th className="py-3 px-4 font-normal">Location / zone</th>
                <th className="py-3 px-4 font-normal">Lead contact</th>
                <th className="py-3 px-4 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-white/[0.04]">
              {sortedActivities.map((act) => {
                const hasConflict = conflictedActivityIds.has(act.id);
                return (
                  <tr
                    key={act.id}
                    className={`h-14 transition-colors ${
                      hasConflict
                        ? 'bg-red-500/[0.06] dark:bg-red-500/[0.08]'
                        : 'hover:bg-stone-50/60 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-3 px-4 tabular-nums text-[#111113] dark:text-[#EDEDEF]">
                      <div className="font-medium">
                        {act.startTime} – {act.endTime}
                      </div>
                      <span className="text-[11px] text-stone-400 dark:text-zinc-500">
                        {act.durationMinutes}m window
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[#111113] dark:text-[#EDEDEF]">
                        {act.title}
                      </div>
                      {act.notes && (
                        <div className="text-[11px] text-stone-400 dark:text-zinc-500 truncate max-w-sm">
                          {act.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-stone-600 dark:text-[#8B8B93]">
                      <span>{act.locationZone}</span>
                    </td>

                    <td className="py-3 px-4 text-stone-600 dark:text-[#8B8B93]">
                      <span>{act.poc}</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                          className="p-1 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          aria-label={`Delete activity ${act.title}`}
                          title="Delete activity"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddActivity={addDayOfActivity}
      />
    </div>
  );
};

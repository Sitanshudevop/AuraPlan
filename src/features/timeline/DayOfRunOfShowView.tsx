import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Button } from '../../components/ui/Button';
import { AddActivityModal } from './AddActivityModal';
import { detectScheduleConflicts, sortActivitiesChronologically } from './ConflictDetector';
import { Plus } from 'lucide-react';
import { ConflictAlertBanner } from './ConflictAlertBanner';
import { RunOfShowTableRow } from './RunOfShowTableRow';

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
      <ConflictAlertBanner
        conflicts={conflicts}
        onShiftActivity={shiftActivity30m}
      />

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
              {sortedActivities.map((act) => (
                <RunOfShowTableRow
                  key={act.id}
                  activity={act}
                  hasConflict={conflictedActivityIds.has(act.id)}
                  onShiftActivity={shiftActivity30m}
                  onDeleteActivity={deleteDayOfActivity}
                />
              ))}
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

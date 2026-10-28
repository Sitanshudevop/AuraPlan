import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DietarySummaryBar } from './DietarySummaryBar';
import { ZoneCapacityMeters } from './ZoneCapacityMeters';
import { GuestTable } from './GuestTable';
import { Button } from '../../components/ui/Button';
import { AddGuestModal } from './AddGuestModal';
import { UserPlus } from 'lucide-react';

export const GuestsTab: React.FC = () => {
  const { state, updateGuest, addGuest, deleteGuest } = useWorkspace();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#18181B] dark:text-[#FAFAFA] tracking-tight">
            Guest RSVP, Dietary Matrix & Capacity Planner
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Real-time catering dietary breakdowns and physical zone capacity allocation
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          icon={<UserPlus className="w-3.5 h-3.5" />}
        >
          Add Guest
        </Button>
      </div>

      {/* Automatic Catering Sync: Dietary Breakdown Bar */}
      <DietarySummaryBar guests={state.guests} />

      {/* Zone Capacity Meters */}
      <ZoneCapacityMeters zones={state.zones} />

      {/* Main Guest Roster Table */}
      <GuestTable
        guests={state.guests}
        zones={state.zones}
        onUpdateGuest={updateGuest}
        onDeleteGuest={deleteGuest}
      />

      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGuest={addGuest}
        zones={state.zones}
      />
    </div>
  );
};

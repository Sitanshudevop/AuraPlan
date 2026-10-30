import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DietarySummaryBar } from './DietarySummaryBar';
import { ZoneCapacityMeters } from './ZoneCapacityMeters';
import { GuestTable } from './GuestTable';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { AddGuestModal } from './AddGuestModal';
import { UserPlus } from 'lucide-react';

export const GuestsTab: React.FC = () => {
  const { state, updateGuest, addGuest, deleteGuest } = useWorkspace();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest RSVP, Dietary Matrix & Capacity Planner"
        subtitle="RSVP status, catering dietary preferences, and venue zone allocations."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Add guest
          </Button>
        }
      />

      {/* Live dietary breakdown */}
      <DietarySummaryBar guests={state.guests} />

      {/* Zone capacity */}
      <ZoneCapacityMeters zones={state.zones} />

      {/* Guest roster table */}
      <GuestTable
        guests={state.guests}
        zones={state.zones}
        onUpdateGuest={updateGuest}
        onDeleteGuest={deleteGuest}
      />

      {/* Add guest modal */}
      <AddGuestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGuest={addGuest}
        zones={state.zones}
      />
    </div>
  );
};

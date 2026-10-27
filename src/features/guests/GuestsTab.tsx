import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DietarySummaryBar } from './DietarySummaryBar';
import { ZoneCapacityMeters } from './ZoneCapacityMeters';
import { GuestTable } from './GuestTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { GuestGroup, DietaryTag, RsvpStatus } from '../../types/guest';
import { UserPlus } from 'lucide-react';
import { sanitizeInput } from '../../utils/sanitizer';

export const GuestsTab: React.FC = () => {
  const { state, updateGuest, addGuest, deleteGuest } = useWorkspace();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [group, setGroup] = useState<GuestGroup>('general');
  const [rsvp, setRsvp] = useState<RsvpStatus>('confirmed');
  const [dietary, setDietary] = useState<DietaryTag>('vegetarian');
  const [plusOnes, setPlusOnes] = useState<number>(0);
  const [zoneId, setZoneId] = useState<string>('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name);
    if (!cleanName) return;

    addGuest({
      id: `g-${Date.now()}`,
      name: cleanName,
      group,
      rsvp,
      dietary,
      plusOnes: Number(plusOnes),
      tableOrZoneId: zoneId || undefined,
    });

    setName('');
    setPlusOnes(0);
    setIsAddModalOpen(false);
  };

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
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Attendee to Guest Roster"
        description="Records dietary preferences, plus-ones, and table/zone placement."
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          <div>
            <label htmlFor="guest-input-name" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Full Name
            </label>
            <input
              id="guest-input-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Siddharth Sharma"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="guest-select-group" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
                Group Side
              </label>
              <select
                id="guest-select-group"
                value={group}
                onChange={(e) => setGroup(e.target.value as GuestGroup)}
                className="w-full px-2 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
              >
                <option value="bride">Bride Side</option>
                <option value="groom">Groom Side</option>
                <option value="vip">VIP Guest</option>
                <option value="speaker_sponsor">Speaker / Sponsor</option>
                <option value="general">General Attendee</option>
              </select>
            </div>

            <div>
              <label htmlFor="guest-select-rsvp" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
                RSVP Status
              </label>
              <select
                id="guest-select-rsvp"
                value={rsvp}
                onChange={(e) => setRsvp(e.target.value as RsvpStatus)}
                className="w-full px-2 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="guest-select-dietary" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
                Dietary Preference
              </label>
              <select
                id="guest-select-dietary"
                value={dietary}
                onChange={(e) => setDietary(e.target.value as DietaryTag)}
                className="w-full px-2 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
              >
                <option value="regular">Regular</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="jain">Jain (No Root Veg)</option>
                <option value="vegan">Vegan</option>
                <option value="gluten_free">Gluten-Free</option>
                <option value="nut_free">Nut-Free</option>
              </select>
            </div>

            <div>
              <label htmlFor="guest-input-plusones" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
                Additional Covers (+Pax)
              </label>
              <input
                id="guest-input-plusones"
                type="number"
                min="0"
                max="10"
                value={plusOnes}
                onChange={(e) => setPlusOnes(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label htmlFor="guest-select-zone" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Table / Zone Assignment
            </label>
            <select
              id="guest-select-zone"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full px-2 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            >
              <option value="">Unassigned</option>
              {state.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} (Max {z.maxCapacity})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-stone-200 dark:border-zinc-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Guest
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

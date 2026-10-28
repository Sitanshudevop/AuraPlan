import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Guest, GuestGroup, DietaryTag, RsvpStatus, ZoneCapacity } from '../../types/guest';
import { sanitizeInput } from '../../utils/sanitizer';

export interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (guest: Guest) => void;
  zones: ZoneCapacity[];
}

export const AddGuestModal: React.FC<AddGuestModalProps> = ({
  isOpen,
  onClose,
  onAddGuest,
  zones,
}) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState<GuestGroup>('general');
  const [rsvp, setRsvp] = useState<RsvpStatus>('confirmed');
  const [dietary, setDietary] = useState<DietaryTag>('vegetarian');
  const [plusOnes, setPlusOnes] = useState<number>(0);
  const [zoneId, setZoneId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name);
    if (!cleanName) return;

    onAddGuest({
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
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Attendee to Guest Roster"
      description="Records dietary preferences, plus-ones, and table/zone placement."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
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
              Initial RSVP
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
            <label htmlFor="guest-select-diet" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Dietary Profile
            </label>
            <select
              id="guest-select-diet"
              value={dietary}
              onChange={(e) => setDietary(e.target.value as DietaryTag)}
              className="w-full px-2 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="jain">Strict Jain (No root veg)</option>
              <option value="halal">Halal</option>
              <option value="gluten_free">Gluten-Free</option>
              <option value="non_veg">Non-Vegetarian</option>
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
            {zones.map((z) => (
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
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Guest
          </Button>
        </div>
      </form>
    </Modal>
  );
};


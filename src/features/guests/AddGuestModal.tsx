import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select, SelectOption } from '../../components/ui/Select';
import { Guest, GuestGroup, DietaryTag, RsvpStatus, ZoneCapacity } from '../../types/guest';
import { useAddGuestForm } from './useAddGuestForm';

export interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (guest: Guest) => void;
  zones: ZoneCapacity[];
}

export const GUEST_GROUP_OPTIONS: SelectOption[] = [
  { value: 'bride', label: 'Bride side' },
  { value: 'groom', label: 'Groom side' },
  { value: 'vip', label: 'VIP guest' },
  { value: 'speaker_sponsor', label: 'Speaker / sponsor' },
  { value: 'general', label: 'General attendee' },
];

export const GUEST_RSVP_OPTIONS: SelectOption[] = [
  { value: 'confirmed', label: 'Confirmed', dotColor: 'bg-emerald-500' },
  { value: 'pending', label: 'Pending', dotColor: 'bg-amber-500' },
  { value: 'declined', label: 'Declined', dotColor: 'bg-rose-500' },
];

export const GUEST_DIETARY_OPTIONS: SelectOption[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'vegetarian', label: 'Vegetarian', dotColor: 'bg-emerald-500' },
  { value: 'jain', label: 'Jain (no root veg)', dotColor: 'bg-amber-500' },
  { value: 'vegan', label: 'Vegan', dotColor: 'bg-teal-500' },
  { value: 'gluten_free', label: 'Gluten-free', dotColor: 'bg-indigo-500' },
  { value: 'nut_free', label: 'Nut-free', dotColor: 'bg-rose-500' },
];

export const AddGuestModal: React.FC<AddGuestModalProps> = ({
  isOpen,
  onClose,
  onAddGuest,
  zones,
}) => {
  const form = useAddGuestForm({ onAddGuest, onClose });

  const zoneOptions: SelectOption[] = [
    { value: '', label: 'Unassigned' },
    ...zones.map((z) => ({ value: z.id, label: `${z.name} (Max ${z.maxCapacity})` })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Attendee to Guest Roster"
      description="Record dietary preferences, party size, and zone placement."
      maxWidth="md"
    >
      <form onSubmit={form.handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="guest-input-name" className="block text-muted font-medium mb-1">
            Full name
          </label>
          <input
            id="guest-input-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => form.setName(e.target.value)}
            placeholder="e.g. Dr. Siddharth Sharma"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">Group</label>
            <Select
              value={form.group}
              onChange={(val) => form.setGroup(val as GuestGroup)}
              options={GUEST_GROUP_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">RSVP status</label>
            <Select
              value={form.rsvp}
              onChange={(val) => form.setRsvp(val as RsvpStatus)}
              options={GUEST_RSVP_OPTIONS}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">Dietary profile</label>
            <Select
              value={form.dietary}
              onChange={(val) => form.setDietary(val as DietaryTag)}
              options={GUEST_DIETARY_OPTIONS}
            />
          </div>

          <div>
            <label htmlFor="guest-input-plusones" className="block text-muted font-medium mb-1">
              Plus-ones
            </label>
            <input
              id="guest-input-plusones"
              type="number"
              min="0"
              max="10"
              value={form.plusOnes}
              onChange={(e) => form.setPlusOnes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground tabular-nums focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-muted font-medium mb-1">
            Zone / table assignment
          </label>
          <Select
            value={form.zoneId}
            onChange={(val) => form.setZoneId(val)}
            options={zoneOptions}
          />
        </div>

        <div className="pt-3 border-t border-hairline flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save guest
          </Button>
        </div>
      </form>
    </Modal>
  );
};

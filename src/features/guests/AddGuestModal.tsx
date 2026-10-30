import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select, SelectOption } from '../../components/ui/Select';
import { Guest, GuestGroup, DietaryTag, RsvpStatus, ZoneCapacity } from '../../types/guest';
import { sanitizeInput } from '../../utils/sanitizer';

export interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (guest: Guest) => void;
  zones: ZoneCapacity[];
}

const groupOptions: SelectOption[] = [
  { value: 'bride', label: 'Bride side' },
  { value: 'groom', label: 'Groom side' },
  { value: 'vip', label: 'VIP guest' },
  { value: 'speaker_sponsor', label: 'Speaker / sponsor' },
  { value: 'general', label: 'General attendee' },
];

const rsvpOptions: SelectOption[] = [
  { value: 'confirmed', label: 'Confirmed', dotColor: 'bg-emerald-500' },
  { value: 'pending', label: 'Pending', dotColor: 'bg-amber-500' },
  { value: 'declined', label: 'Declined', dotColor: 'bg-rose-500' },
];

const dietaryOptions: SelectOption[] = [
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
  const [name, setName] = useState('');
  const [group, setGroup] = useState<GuestGroup>('general');
  const [rsvp, setRsvp] = useState<RsvpStatus>('confirmed');
  const [dietary, setDietary] = useState<DietaryTag>('vegetarian');
  const [plusOnes, setPlusOnes] = useState<number>(0);
  const [zoneId, setZoneId] = useState<string>('');

  const zoneOptions: SelectOption[] = [
    { value: '', label: 'Unassigned' },
    ...zones.map((z) => ({ value: z.id, label: `${z.name} (Max ${z.maxCapacity})` })),
  ];

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
      description="Record dietary preferences, party size, and zone placement."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="guest-input-name" className="block text-muted font-medium mb-1">
            Full name
          </label>
          <input
            id="guest-input-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Siddharth Sharma"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">
              Group
            </label>
            <Select
              value={group}
              onChange={(val) => setGroup(val as GuestGroup)}
              options={groupOptions}
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">
              RSVP status
            </label>
            <Select
              value={rsvp}
              onChange={(val) => setRsvp(val as RsvpStatus)}
              options={rsvpOptions}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">
              Dietary profile
            </label>
            <Select
              value={dietary}
              onChange={(val) => setDietary(val as DietaryTag)}
              options={dietaryOptions}
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
              value={plusOnes}
              onChange={(e) => setPlusOnes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground tabular-nums focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-muted font-medium mb-1">
            Zone / table assignment
          </label>
          <Select
            value={zoneId}
            onChange={(val) => setZoneId(val)}
            options={zoneOptions}
          />
        </div>

        <div className="pt-3 border-t border-hairline flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
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

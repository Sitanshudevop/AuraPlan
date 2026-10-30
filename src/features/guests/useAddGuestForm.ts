import { useState } from 'react';
import { Guest, GuestGroup, DietaryTag, RsvpStatus } from '../../types/guest';
import { sanitizeInput } from '../../utils/security';

interface UseAddGuestFormProps {
  onAddGuest: (guest: Guest) => void;
  onClose: () => void;
}

export function useAddGuestForm({ onAddGuest, onClose }: UseAddGuestFormProps) {
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

  return {
    name,
    setName,
    group,
    setGroup,
    rsvp,
    setRsvp,
    dietary,
    setDietary,
    plusOnes,
    setPlusOnes,
    zoneId,
    setZoneId,
    handleSubmit,
  };
}

import { useState, useEffect } from 'react';
import { EventType, EventSetting } from '../../types/event';
import { EventWorkspaceState } from '../../types/state';
import { sanitizeInput } from '../../utils/security';

interface UseEditEventFormProps {
  isOpen: boolean;
  event: EventWorkspaceState['event'];
  onUpdateEvent: (partial: Partial<EventWorkspaceState['event']>) => void;
  onClose: () => void;
  announce: (msg: string) => void;
}

export function useEditEventForm({
  isOpen,
  event,
  onUpdateEvent,
  onClose,
  announce,
}: UseEditEventFormProps) {
  const [name, setName] = useState(event.name);
  const [type, setType] = useState<EventType>(event.type);
  const [date, setDate] = useState(event.date);
  const [city, setCity] = useState(event.city);
  const [setting, setSetting] = useState<EventSetting>(event.setting);
  const [guestCount, setGuestCount] = useState<number>(event.guestCount);
  const [targetBudget, setTargetBudget] = useState<number>(event.targetBudget);
  const [culturalPreferences, setCulturalPreferences] = useState(event.culturalPreferences || '');

  useEffect(() => {
    if (isOpen) {
      setName(event.name);
      setType(event.type);
      setDate(event.date);
      setCity(event.city);
      setSetting(event.setting);
      setGuestCount(event.guestCount);
      setTargetBudget(event.targetBudget);
      setCulturalPreferences(event.culturalPreferences || '');
    }
  }, [isOpen, event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name);
    const cleanCity = sanitizeInput(city);
    const cleanPrefs = sanitizeInput(culturalPreferences);

    if (!cleanName || !cleanCity) return;

    onUpdateEvent({
      name: cleanName,
      type,
      date,
      city: cleanCity,
      setting,
      guestCount: Math.max(1, Number(guestCount)),
      targetBudget: Math.max(1000, Number(targetBudget)),
      culturalPreferences: cleanPrefs,
    });

    announce(`Updated event details for ${cleanName}`);
    onClose();
  };

  return {
    name,
    setName,
    type,
    setType,
    date,
    setDate,
    city,
    setCity,
    setting,
    setSetting,
    guestCount,
    setGuestCount,
    targetBudget,
    setTargetBudget,
    culturalPreferences,
    setCulturalPreferences,
    handleSubmit,
  };
}

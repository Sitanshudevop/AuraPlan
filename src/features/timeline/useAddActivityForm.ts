import { useState } from 'react';
import { DayOfActivity } from '../../types/timeline';
import { sanitizeInput } from '../../utils/security';

interface UseAddActivityFormProps {
  onAddActivity: (activity: DayOfActivity) => void;
  onClose: () => void;
}

export function useAddActivityForm({ onAddActivity, onClose }: UseAddActivityFormProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:00');
  const [locationZone, setLocationZone] = useState('Main Lawn / Mandap');
  const [poc, setPoc] = useState('Ritual Lead');
  const [notes, setNotes] = useState('');

  const calculateDuration = (start: string, end: string): number => {
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      return diff > 0 ? diff : 60;
    } catch {
      return 60;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeInput(title);
    const cleanLocation = sanitizeInput(locationZone);
    const cleanPoc = sanitizeInput(poc);
    const cleanNotes = sanitizeInput(notes);
    if (!cleanTitle) return;

    const duration = calculateDuration(startTime, endTime);

    onAddActivity({
      id: `act-user-${Date.now()}`,
      startTime,
      endTime,
      title: cleanTitle,
      durationMinutes: duration,
      locationZone: cleanLocation || 'Main Hall',
      poc: cleanPoc || 'Coordinator',
      notes: cleanNotes || undefined,
    });

    setTitle('');
    setNotes('');
    onClose();
  };

  return {
    title,
    setTitle,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    locationZone,
    setLocationZone,
    poc,
    setPoc,
    notes,
    setNotes,
    handleSubmit,
  };
}


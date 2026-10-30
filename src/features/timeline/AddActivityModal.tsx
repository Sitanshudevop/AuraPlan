import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { DayOfActivity } from '../../types/timeline';
import { sanitizeInput } from '../../utils/security';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (activity: DayOfActivity) => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onAddActivity,
}) => {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Day-Of Run-of-Show Activity"
      description="Schedule minute-by-minute cues with start/end windows, zones, and assigned leads."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="activity-title" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
            Activity / Ritual Title
          </label>
          <input
            id="activity-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sunset Varmala & Rose Petal Shower"
            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="activity-start" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Start Time (24h)
            </label>
            <input
              id="activity-start"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md font-mono dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="activity-end" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              End Time (24h)
            </label>
            <input
              id="activity-end"
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md font-mono dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="activity-zone" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Location / Staging Zone
            </label>
            <input
              id="activity-zone"
              type="text"
              required
              value={locationZone}
              onChange={(e) => setLocationZone(e.target.value)}
              placeholder="e.g. Lakefront Pier, Royal Courtyard"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="activity-poc" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Point of Contact (POC)
            </label>
            <input
              id="activity-poc"
              type="text"
              required
              value={poc}
              onChange={(e) => setPoc(e.target.value)}
              placeholder="e.g. Lead Choreographer, AV Captain"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="activity-notes" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
            Operational Cues & Tech Notes
          </label>
          <input
            id="activity-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Cue cold fireworks at ring exchange; dim chandeliers to 20%"
            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Add to Run-of-Show
          </Button>
        </div>
      </form>
    </Modal>
  );
};


import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { DayOfActivity } from '../../types/timeline';
import { useAddActivityForm } from './useAddActivityForm';

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
  const form = useAddActivityForm({ onAddActivity, onClose });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Day-Of Run-of-Show Activity"
      description="Schedule minute-by-minute cues with start/end windows, zones, and assigned leads."
      maxWidth="md"
    >
      <form onSubmit={form.handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="activity-title" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
            Activity / Ritual Title
          </label>
          <input
            id="activity-title"
            type="text"
            required
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
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
              value={form.startTime}
              onChange={(e) => form.setStartTime(e.target.value)}
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
              value={form.endTime}
              onChange={(e) => form.setEndTime(e.target.value)}
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
              value={form.locationZone}
              onChange={(e) => form.setLocationZone(e.target.value)}
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
              value={form.poc}
              onChange={(e) => form.setPoc(e.target.value)}
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
            value={form.notes}
            onChange={(e) => form.setNotes(e.target.value)}
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

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';
import { EventType, EventSetting } from '../../types/event';
import { sanitizeInput } from '../../utils/security';

const typeOptions: SelectOption[] = [
  { value: 'wedding', label: 'Wedding celebration' },
  { value: 'birthday', label: 'Milestone birthday / gala' },
  { value: 'community', label: 'Community / summit' },
];

const settingOptions: SelectOption[] = [
  { value: 'indoor', label: 'Indoor banquet / ballroom' },
  { value: 'outdoor', label: 'Outdoor lawn / terrace' },
  { value: 'hybrid', label: 'Hybrid (indoor + outdoor)' },
];

export const EditEventModal: React.FC = () => {
  const { state, updateEvent, isEditEventModalOpen, setEditEventModalOpen, currency, announce } = useWorkspace();

  const [name, setName] = useState(state.event.name);
  const [type, setType] = useState<EventType>(state.event.type);
  const [date, setDate] = useState(state.event.date);
  const [city, setCity] = useState(state.event.city);
  const [setting, setSetting] = useState<EventSetting>(state.event.setting);
  const [guestCount, setGuestCount] = useState<number>(state.event.guestCount);
  const [targetBudget, setTargetBudget] = useState<number>(state.event.targetBudget);
  const [culturalPreferences, setCulturalPreferences] = useState(state.event.culturalPreferences || '');

  useEffect(() => {
    if (isEditEventModalOpen) {
      setName(state.event.name);
      setType(state.event.type);
      setDate(state.event.date);
      setCity(state.event.city);
      setSetting(state.event.setting);
      setGuestCount(state.event.guestCount);
      setTargetBudget(state.event.targetBudget);
      setCulturalPreferences(state.event.culturalPreferences || '');
    }
  }, [isEditEventModalOpen, state.event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name);
    const cleanCity = sanitizeInput(city);
    const cleanPrefs = sanitizeInput(culturalPreferences);

    if (!cleanName || !cleanCity) return;

    updateEvent({
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
    setEditEventModalOpen(false);
  };

  return (
    <Modal
      isOpen={isEditEventModalOpen}
      onClose={() => setEditEventModalOpen(false)}
      title="Edit event parameters"
      description="Update target budget, date, attendee count, and destination."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label htmlFor="edit-event-name" className="block text-muted font-medium mb-1">
            Event name
          </label>
          <input
            id="edit-event-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">
              Event mode
            </label>
            <Select
              value={type}
              onChange={(val) => setType(val as EventType)}
              options={typeOptions}
            />
          </div>

          <div>
            <label htmlFor="edit-event-date" className="block text-muted font-medium mb-1">
              Date
            </label>
            <input
              id="edit-event-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="edit-event-city" className="block text-muted font-medium mb-1">
              City / venue
            </label>
            <input
              id="edit-event-city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            />
          </div>

          <div>
            <label htmlFor="edit-event-guests" className="block text-muted font-medium mb-1">
              Guest count
            </label>
            <input
              id="edit-event-guests"
              type="number"
              min="1"
              required
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="edit-event-budget" className="block text-muted font-medium mb-1">
              Target budget ({currency})
            </label>
            <input
              id="edit-event-budget"
              type="number"
              min="1000"
              step="1000"
              required
              value={targetBudget}
              onChange={(e) => setTargetBudget(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-muted font-medium mb-1">
            Setting
          </label>
          <Select
            value={setting}
            onChange={(val) => setSetting(val as EventSetting)}
            options={settingOptions}
          />
        </div>

        <div>
          <label htmlFor="edit-event-prefs" className="block text-muted font-medium mb-1">
            Styling & dietary notes
          </label>
          <input
            id="edit-event-prefs"
            type="text"
            value={culturalPreferences}
            onChange={(e) => setCulturalPreferences(e.target.value)}
            placeholder="e.g. Royal Marwari, candle scapes, vegan counters"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-hairline">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditEventModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { EventType, EventSetting } from '../../types/event';
import { sanitizeInput } from '../../utils/sanitizer';
import { Calendar, Users, MapPin, Sparkles } from 'lucide-react';

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
      title="Edit Event Parameters"
      description="Update core budget target, date, attendee count, and destination parameters."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label htmlFor="edit-event-name" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
            Event Name
          </label>
          <input
            id="edit-event-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="edit-event-type" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Event Modality
            </label>
            <select
              id="edit-event-type"
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            >
              <option value="wedding">Royal & Heritage Wedding</option>
              <option value="birthday">Milestone Birthday Celebration</option>
              <option value="community">Community & Civic Gathering</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-event-date" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-stone-400" /> Date
            </label>
            <input
              id="edit-event-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="edit-event-city" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-stone-400" /> City / Venue
            </label>
            <input
              id="edit-event-city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="edit-event-guests" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              <Users className="w-3.5 h-3.5 inline mr-1 text-stone-400" /> Guest Count
            </label>
            <input
              id="edit-event-guests"
              type="number"
              min="1"
              required
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md font-mono dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="edit-event-budget" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Target Budget ({currency === 'INR' ? '₹' : '$'})
            </label>
            <input
              id="edit-event-budget"
              type="number"
              min="1000"
              step="1000"
              required
              value={targetBudget}
              onChange={(e) => setTargetBudget(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md font-mono dark:text-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-event-prefs" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-500" /> Cultural Preferences / Creative Vibe
          </label>
          <input
            id="edit-event-prefs"
            type="text"
            value={culturalPreferences}
            onChange={(e) => setCulturalPreferences(e.target.value)}
            placeholder="e.g. Royal Rajasthani with candle scapes, vegan live counters"
            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditEventModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

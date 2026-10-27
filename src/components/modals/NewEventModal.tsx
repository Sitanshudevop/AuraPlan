import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { EventType, EventSetting } from '../../types/event';
import { generateCustomPlan } from '../../services/geminiService';
import { Sparkles, Loader2 } from 'lucide-react';
import { sanitizeInput } from '../../utils/sanitizer';

export const NewEventModal: React.FC = () => {
  const { isNewEventModalOpen, setNewEventModalOpen, setCustomState, currency, setActiveTab } = useWorkspace();

  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('wedding');
  const [date, setDate] = useState('2026-12-20');
  const [city, setCity] = useState('');
  const [setting, setSetting] = useState<EventSetting>('indoor');
  const [guestCount, setGuestCount] = useState<number>(150);
  const [targetBudget, setTargetBudget] = useState<number>(500000);
  const [culturalPreferences, setCulturalPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name);
    const cleanCity = sanitizeInput(city);
    const cleanPrefs = sanitizeInput(culturalPreferences);

    if (!cleanName || !cleanCity) {
      setError('Event Name and City are required.');
      return;
    }
    if (guestCount <= 0 || targetBudget <= 0) {
      setError('Guest count and target budget must be positive numbers.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newState = await generateCustomPlan({
        name: cleanName,
        type,
        date,
        city: cleanCity,
        setting,
        guestCount: Number(guestCount),
        targetBudget: Number(targetBudget),
        currency,
        culturalPreferences: cleanPrefs,
      });

      setCustomState(newState);
      setNewEventModalOpen(false);
      setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
      setError('Plan synthesis failed. Please review your parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isNewEventModalOpen}
      onClose={() => setNewEventModalOpen(false)}
      title="Synthesize New Custom Event Plan"
      description="Powered by Gemini 3.8 Flash with deterministic fallback engine. Generates sub-events, budget breakdown, vendor roster, and day-of timeline."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div id="event-form-error" role="alert" className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-input-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              Event Name
            </label>
            <input
              id="event-input-name"
              type="text"
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'event-form-error' : undefined}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kyoto Cherry Blossom Soirée"
              className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="event-select-type" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              Event Mode / Type
            </label>
            <select
              id="event-select-type"
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 dark:text-white"
            >
              <option value="wedding">Wedding Celebration Mode</option>
              <option value="birthday">Milestone Birthday / Gala Mode</option>
              <option value="community">Community / Summit Mode</option>
            </select>
          </div>

          <div>
            <label htmlFor="event-input-date" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              Event Date
            </label>
            <input
              id="event-input-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 dark:text-white font-mono tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="event-input-city" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              City / Destination
            </label>
            <input
              id="event-input-city"
              type="text"
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'event-form-error' : undefined}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Goa, India"
              className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="event-input-guests" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              Guest Count
            </label>
            <input
              id="event-input-guests"
              type="number"
              min="1"
              required
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 dark:text-white font-mono tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="event-input-budget" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              Target Budget ({currency})
            </label>
            <input
              id="event-input-budget"
              type="number"
              min="1000"
              required
              value={targetBudget}
              onChange={(e) => setTargetBudget(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 dark:text-white font-mono tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="event-select-setting" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              Setting
            </label>
            <select
              id="event-select-setting"
              value={setting}
              onChange={(e) => setSetting(e.target.value as EventSetting)}
              className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 dark:text-white"
            >
              <option value="indoor">Indoor Banquet / Ballroom</option>
              <option value="outdoor">Outdoor Lawn / Beach / Rooftop</option>
              <option value="hybrid">Hybrid (Indoor + Outdoor Pavilions)</option>
            </select>
          </div>

          <div>
            <label htmlFor="event-input-prefs" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              Styling & Dietary Notes
            </label>
            <input
              id="event-input-prefs"
              type="text"
              value={culturalPreferences}
              onChange={(e) => setCulturalPreferences(e.target.value)}
              placeholder="e.g. Modern bohemian, strict Jain counter, live indie band"
              className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setNewEventModalOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading}
            icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          >
            {loading ? 'Synthesizing Plan...' : 'Generate Complete Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

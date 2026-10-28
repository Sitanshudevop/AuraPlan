import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { EventType, EventSetting } from '../../types/event';
import { generateCustomPlan } from '../../services/geminiService';
import { Sparkles, Loader2 } from 'lucide-react';
import { sanitizeInput } from '../../utils/sanitizer';
import { logger } from '../../utils/logger';
import { EventModalFormFields } from './EventModalFormFields';

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
      logger.error('Custom plan synthesis failed', err);
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

        <EventModalFormFields
          name={name}
          setName={setName}
          type={type}
          setType={setType}
          date={date}
          setDate={setDate}
          city={city}
          setCity={setCity}
          guestCount={guestCount}
          setGuestCount={setGuestCount}
          targetBudget={targetBudget}
          setTargetBudget={setTargetBudget}
          currency={currency}
          setting={setting}
          setSetting={setSetting}
          culturalPreferences={culturalPreferences}
          setCulturalPreferences={setCulturalPreferences}
          hasError={!!error}
        />

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

import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { EventType, EventSetting } from '../../types/event';
import { generateCustomPlan } from '../../services/geminiService';
import { Loader2 } from 'lucide-react';
import { sanitizeInput } from '../../utils/security';
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
      setError('Plan generation failed. Please review your parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isNewEventModalOpen}
      onClose={() => setNewEventModalOpen(false)}
      title="Create event plan"
      description="Generates sub-events, budget breakdown, vendor roster, and run-of-show."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            id="event-form-error"
            role="alert"
            className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-md"
          >
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

        <div className="pt-3 border-t border-hairline flex items-center justify-end gap-2">
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
            icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
          >
            {loading ? 'Generating...' : 'Generate Complete Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

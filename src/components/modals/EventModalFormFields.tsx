import React from 'react';
import { EventType, EventSetting, Currency } from '../../types/event';
import { Select, SelectOption } from '../ui/Select';

export interface EventModalFormFieldsProps {
  name: string;
  setName: (v: string) => void;
  type: EventType;
  setType: (v: EventType) => void;
  date: string;
  setDate: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  guestCount: number;
  setGuestCount: (v: number) => void;
  targetBudget: number;
  setTargetBudget: (v: number) => void;
  currency: Currency;
  setting: EventSetting;
  setSetting: (v: EventSetting) => void;
  culturalPreferences: string;
  setCulturalPreferences: (v: string) => void;
  hasError: boolean;
}

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

export const EventModalFormFields: React.FC<EventModalFormFieldsProps> = ({
  name,
  setName,
  type,
  setType,
  date,
  setDate,
  city,
  setCity,
  guestCount,
  setGuestCount,
  targetBudget,
  setTargetBudget,
  currency,
  setting,
  setSetting,
  culturalPreferences,
  setCulturalPreferences,
  hasError,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
      <div>
        <label htmlFor="event-input-name" className="block font-medium text-muted mb-1">
          Event name
        </label>
        <input
          id="event-input-name"
          type="text"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? 'event-form-error' : undefined}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Udaipur Royal Heritage Wedding"
          className="w-full text-xs px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
        />
      </div>

      <div>
        <label className="block font-medium text-muted mb-1">
          Event mode
        </label>
        <Select
          value={type}
          onChange={(val) => setType(val as EventType)}
          options={typeOptions}
        />
      </div>

      <div>
        <label htmlFor="event-input-date" className="block font-medium text-muted mb-1">
          Event date
        </label>
        <input
          id="event-input-date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-xs px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground tabular-nums"
        />
      </div>

      <div>
        <label htmlFor="event-input-city" className="block font-medium text-muted mb-1">
          City / destination
        </label>
        <input
          id="event-input-city"
          type="text"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? 'event-form-error' : undefined}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Udaipur, Rajasthan"
          className="w-full text-xs px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
        />
      </div>

      <div>
        <label htmlFor="event-input-guests" className="block font-medium text-muted mb-1">
          Guest count
        </label>
        <input
          id="event-input-guests"
          type="number"
          min="1"
          required
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="w-full text-xs px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground tabular-nums"
        />
      </div>

      <div>
        <label htmlFor="event-input-budget" className="block font-medium text-muted mb-1">
          Target budget ({currency})
        </label>
        <input
          id="event-input-budget"
          type="number"
          min="1000"
          required
          value={targetBudget}
          onChange={(e) => setTargetBudget(Number(e.target.value))}
          className="w-full text-xs px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground tabular-nums"
        />
      </div>

      <div>
        <label className="block font-medium text-muted mb-1">
          Setting
        </label>
        <Select
          value={setting}
          onChange={(val) => setSetting(val as EventSetting)}
          options={settingOptions}
        />
      </div>

      <div>
        <label htmlFor="event-input-prefs" className="block font-medium text-muted mb-1">
          Styling & dietary notes
        </label>
        <input
          id="event-input-prefs"
          type="text"
          value={culturalPreferences}
          onChange={(e) => setCulturalPreferences(e.target.value)}
          placeholder="e.g. Royal Marwari, lakeside lawn, sangeet night"
          className="w-full text-xs px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
        />
      </div>
    </div>
  );
};

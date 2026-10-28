import React from 'react';
import { EventType, EventSetting, Currency } from '../../types/event';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="event-input-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
          Event Name
        </label>
        <input
          id="event-input-name"
          type="text"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? 'event-form-error' : undefined}
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
          aria-invalid={hasError}
          aria-describedby={hasError ? 'event-form-error' : undefined}
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
  );
};


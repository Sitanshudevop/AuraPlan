import React from 'react';
import { EventType, EventSetting } from '../../types/event';
import { Select, SelectOption } from '../ui/Select';

export interface EventBasicInfoFieldsProps {
  name: string;
  setName: (v: string) => void;
  type: EventType;
  setType: (v: EventType) => void;
  setting: EventSetting;
  setSetting: (v: EventSetting) => void;
  culturalPreferences: string;
  setCulturalPreferences: (v: string) => void;
  hasError: boolean;
}

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'wedding', label: 'Wedding celebration' },
  { value: 'birthday', label: 'Milestone birthday / gala' },
  { value: 'community', label: 'Community / summit' },
];

const SETTING_OPTIONS: SelectOption[] = [
  { value: 'indoor', label: 'Indoor banquet / ballroom' },
  { value: 'outdoor', label: 'Outdoor lawn / terrace' },
  { value: 'hybrid', label: 'Hybrid (indoor + outdoor)' },
];

export const EventBasicInfoFields: React.FC<EventBasicInfoFieldsProps> = ({
  name,
  setName,
  type,
  setType,
  setting,
  setSetting,
  culturalPreferences,
  setCulturalPreferences,
  hasError,
}) => {
  return (
    <>
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
        <label className="block font-medium text-muted mb-1">Event mode</label>
        <Select
          value={type}
          onChange={(val) => setType(val as EventType)}
          options={TYPE_OPTIONS}
        />
      </div>

      <div>
        <label className="block font-medium text-muted mb-1">Setting</label>
        <Select
          value={setting}
          onChange={(val) => setSetting(val as EventSetting)}
          options={SETTING_OPTIONS}
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
    </>
  );
};

import React from 'react';
import { EventType, EventSetting, Currency } from '../../types/event';
import { EventBasicInfoFields } from './EventBasicInfoFields';
import { EventLogisticsFields } from './EventLogisticsFields';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
      <EventBasicInfoFields
        name={name}
        setName={setName}
        type={type}
        setType={setType}
        setting={setting}
        setSetting={setSetting}
        culturalPreferences={culturalPreferences}
        setCulturalPreferences={setCulturalPreferences}
        hasError={hasError}
      />
      <EventLogisticsFields
        date={date}
        setDate={setDate}
        city={city}
        setCity={setCity}
        guestCount={guestCount}
        setGuestCount={setGuestCount}
        targetBudget={targetBudget}
        setTargetBudget={setTargetBudget}
        currency={currency}
        hasError={hasError}
      />
    </div>
  );
};

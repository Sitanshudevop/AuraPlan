import React from 'react';
import { Currency } from '../../types/event';

export interface EventLogisticsFieldsProps {
  date: string;
  setDate: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  guestCount: number;
  setGuestCount: (v: number) => void;
  targetBudget: number;
  setTargetBudget: (v: number) => void;
  currency: Currency;
  hasError: boolean;
}

export const EventLogisticsFields: React.FC<EventLogisticsFieldsProps> = ({
  date,
  setDate,
  city,
  setCity,
  guestCount,
  setGuestCount,
  targetBudget,
  setTargetBudget,
  currency,
  hasError,
}) => {
  return (
    <>
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
    </>
  );
};


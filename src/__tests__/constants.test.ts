import { describe, it, expect } from 'vitest';
import {
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  TIMELINE_HORIZONS,
  TIMELINE_HORIZON_LABELS,
  VENDOR_STAGES,
  VENDOR_STAGE_LABELS,
  RSVP_STATUSES,
  RSVP_STATUS_LABELS,
  DIETARY_TAGS,
  DIETARY_LABELS,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  EVENT_TYPES,
  EVENT_TYPE_LABELS,
  EVENT_SETTINGS,
  EVENT_SETTING_LABELS,
} from '../constants';

describe('Application Constants & Single Sources of Truth', () => {
  it('has consistent CATEGORY_KEYS and label mappings', () => {
    Object.values(CATEGORY_KEYS).forEach((key) => {
      expect(CATEGORY_LABELS[key]).toBeDefined();
      expect(typeof CATEGORY_LABELS[key]).toBe('string');
    });
  });

  it('has consistent TIMELINE_HORIZONS and label mappings', () => {
    Object.values(TIMELINE_HORIZONS).forEach((key) => {
      expect(TIMELINE_HORIZON_LABELS[key]).toBeDefined();
    });
  });

  it('has consistent VENDOR_STAGES and label mappings', () => {
    Object.values(VENDOR_STAGES).forEach((key) => {
      expect(VENDOR_STAGE_LABELS[key]).toBeDefined();
    });
  });

  it('has consistent RSVP_STATUSES and label mappings', () => {
    Object.values(RSVP_STATUSES).forEach((key) => {
      expect(RSVP_STATUS_LABELS[key]).toBeDefined();
    });
  });

  it('has consistent DIETARY_TAGS and label mappings', () => {
    Object.values(DIETARY_TAGS).forEach((key) => {
      expect(DIETARY_LABELS[key]).toBeDefined();
    });
  });

  it('has consistent CURRENCIES and symbols', () => {
    expect(CURRENCY_SYMBOLS[CURRENCIES.INR]).toBe('₹');
    expect(CURRENCY_SYMBOLS[CURRENCIES.USD]).toBe('$');
  });

  it('has consistent EVENT_TYPES and EVENT_SETTINGS mappings', () => {
    Object.values(EVENT_TYPES).forEach((key) => {
      expect(EVENT_TYPE_LABELS[key]).toBeDefined();
    });
    Object.values(EVENT_SETTINGS).forEach((key) => {
      expect(EVENT_SETTING_LABELS[key]).toBeDefined();
    });
  });
});


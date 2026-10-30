/**
 * Application Constants & Single Sources of Truth
 * Derived union types guarantee compile-time type safety.
 */

export const CATEGORY_KEYS = {
  VENUE: 'venue',
  CATERING: 'catering',
  DECOR: 'decor',
  AV_PHOTO: 'av_photo',
  ENTERTAINMENT: 'entertainment',
  LOGISTICS: 'logistics',
  BUFFER: 'buffer',
} as const;

export type CategoryKey = typeof CATEGORY_KEYS[keyof typeof CATEGORY_KEYS];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  [CATEGORY_KEYS.VENUE]: 'Venue',
  [CATEGORY_KEYS.CATERING]: 'Catering',
  [CATEGORY_KEYS.DECOR]: 'Decor & Styling',
  [CATEGORY_KEYS.AV_PHOTO]: 'AV & Photo',
  [CATEGORY_KEYS.ENTERTAINMENT]: 'Entertainment',
  [CATEGORY_KEYS.LOGISTICS]: 'Logistics & Permits',
  [CATEGORY_KEYS.BUFFER]: 'Contingency Buffer',
};

export const TIMELINE_HORIZONS = {
  SIX_MONTHS: '6_months',
  THREE_MONTHS: '3_months',
  ONE_MONTH: '1_month',
  ONE_WEEK: '1_week',
  DAY_BEFORE: 'day_before',
} as const;

export type TimelineHorizonKey = typeof TIMELINE_HORIZONS[keyof typeof TIMELINE_HORIZONS];

export const TIMELINE_HORIZON_LABELS: Record<TimelineHorizonKey, string> = {
  [TIMELINE_HORIZONS.SIX_MONTHS]: '6 Months Out',
  [TIMELINE_HORIZONS.THREE_MONTHS]: '3 Months Out',
  [TIMELINE_HORIZONS.ONE_MONTH]: '1 Month Out',
  [TIMELINE_HORIZONS.ONE_WEEK]: '1 Week Out',
  [TIMELINE_HORIZONS.DAY_BEFORE]: 'Day Before',
};

export const VENDOR_STAGES = {
  SHORTLISTED: 'shortlisted',
  CONTACTED: 'contacted',
  QUOTE_RECEIVED: 'quote_received',
  CONTRACT_SIGNED: 'contract_signed',
  PAID: 'paid',
} as const;

export type VendorStageKey = typeof VENDOR_STAGES[keyof typeof VENDOR_STAGES];

export const VENDOR_STAGE_LABELS: Record<VendorStageKey, string> = {
  [VENDOR_STAGES.SHORTLISTED]: 'Shortlisted',
  [VENDOR_STAGES.CONTACTED]: 'Contacted',
  [VENDOR_STAGES.QUOTE_RECEIVED]: 'Quote Received',
  [VENDOR_STAGES.CONTRACT_SIGNED]: 'Contract Signed',
  [VENDOR_STAGES.PAID]: 'Paid & Closed',
};

export const RSVP_STATUSES = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  DECLINED: 'declined',
} as const;

export type RsvpStatusKey = typeof RSVP_STATUSES[keyof typeof RSVP_STATUSES];

export const RSVP_STATUS_LABELS: Record<RsvpStatusKey, string> = {
  [RSVP_STATUSES.CONFIRMED]: 'Confirmed',
  [RSVP_STATUSES.PENDING]: 'Pending',
  [RSVP_STATUSES.DECLINED]: 'Declined',
};

export const DIETARY_TAGS = {
  REGULAR: 'regular',
  VEGETARIAN: 'vegetarian',
  JAIN: 'jain',
  VEGAN: 'vegan',
  GLUTEN_FREE: 'gluten_free',
  NUT_FREE: 'nut_free',
} as const;

export type DietaryTagKey = typeof DIETARY_TAGS[keyof typeof DIETARY_TAGS];

export const DIETARY_LABELS: Record<DietaryTagKey, string> = {
  [DIETARY_TAGS.REGULAR]: 'Regular',
  [DIETARY_TAGS.VEGETARIAN]: 'Vegetarian',
  [DIETARY_TAGS.JAIN]: 'Jain',
  [DIETARY_TAGS.VEGAN]: 'Vegan',
  [DIETARY_TAGS.GLUTEN_FREE]: 'Gluten-Free',
  [DIETARY_TAGS.NUT_FREE]: 'Nut-Free',
};

export const CURRENCIES = {
  INR: 'INR',
  USD: 'USD',
} as const;

export type CurrencyKey = typeof CURRENCIES[keyof typeof CURRENCIES];

export const CURRENCY_SYMBOLS: Record<CurrencyKey, string> = {
  [CURRENCIES.INR]: '₹',
  [CURRENCIES.USD]: '$',
};

export const EVENT_TYPES = {
  WEDDING: 'wedding',
  BIRTHDAY: 'birthday',
  COMMUNITY: 'community',
} as const;

export type EventTypeKey = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

export const EVENT_TYPE_LABELS: Record<EventTypeKey, string> = {
  [EVENT_TYPES.WEDDING]: 'Wedding & Reception',
  [EVENT_TYPES.BIRTHDAY]: 'Milestone Birthday',
  [EVENT_TYPES.COMMUNITY]: 'Community Gala & Fundraiser',
};

export const EVENT_SETTINGS = {
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
  HYBRID: 'hybrid',
} as const;

export type EventSettingKey = typeof EVENT_SETTINGS[keyof typeof EVENT_SETTINGS];

export const EVENT_SETTING_LABELS: Record<EventSettingKey, string> = {
  [EVENT_SETTINGS.INDOOR]: 'Indoor',
  [EVENT_SETTINGS.OUTDOOR]: 'Outdoor',
  [EVENT_SETTINGS.HYBRID]: 'Hybrid (Indoor/Outdoor)',
};


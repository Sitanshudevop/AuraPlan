import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatCurrency,
  convertCurrency,
  formatPercent,
  getDaysRemaining,
  formatDate,
  USD_TO_INR_RATE,
} from '../utils/formatters';
import {
  savePersistedState,
  loadPersistedState,
  clearPersistedState,
  getStorageUsageBytes,
} from '../utils/storage';
import { getLocalVendorVet, getLocalThemeIdea } from '../services/deterministicFallback';
import { weddingPreset } from '../data/weddingPreset';

describe('Services, Storage & Formatters Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Storage Utilities', () => {
    it('persists and retrieves workspace state from localStorage', () => {
      const payload = {
        version: 1,
        activePresetId: 'preset-wedding',
        states: {
          'preset-wedding': weddingPreset,
        },
        theme: 'light' as const,
      };

      savePersistedState(payload);
      const loaded = loadPersistedState();
      expect(loaded).toBeDefined();
      expect(loaded?.version).toBe(1);
      expect(loaded?.activePresetId).toBe('preset-wedding');
      expect(loaded?.states['preset-wedding'].event.name).toBe(weddingPreset.event.name);

      const usage = getStorageUsageBytes();
      expect(usage).toBeGreaterThan(0);

      clearPersistedState();
      expect(loadPersistedState()).toBeNull();
      expect(getStorageUsageBytes()).toBe(0);
    });

    it('returns null gracefully when localStorage contains invalid or corrupt JSON', () => {
      localStorage.setItem('auraplan_workspace_v1', '{invalid-json');
      expect(loadPersistedState()).toBeNull();

      localStorage.setItem('auraplan_workspace_v1', JSON.stringify({ version: 99 }));
      expect(loadPersistedState()).toBeNull();
    });
  });

  describe('Formatters Utilities', () => {
    it('formats currency in INR and USD correctly', () => {
      expect(formatCurrency(150000, 'INR')).toBe('₹1,50,000');
      expect(formatCurrency(2500, 'USD')).toBe('$2,500');
      expect(formatCurrency(0, 'INR')).toBe('₹0');
    });

    it('converts currencies between INR and USD with defined exchange rate', () => {
      expect(convertCurrency(100, 'USD', 'USD')).toBe(100);
      expect(convertCurrency(8350, 'INR', 'USD')).toBe(Math.round(8350 / USD_TO_INR_RATE));
      expect(convertCurrency(100, 'USD', 'INR')).toBe(Math.round(100 * USD_TO_INR_RATE));
    });

    it('formats percentages to 1 decimal place with tabular string output', () => {
      expect(formatPercent(42.567)).toBe('42.6%');
      expect(formatPercent(0)).toBe('0.0%');
      expect(formatPercent(100)).toBe('100.0%');
    });

    it('calculates days remaining until target event date', () => {
      // Future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      const days = getDaysRemaining(futureDate.toISOString());
      expect(days).toBeGreaterThanOrEqual(14);
      expect(days).toBeLessThanOrEqual(16);

      // Past date returns 0
      expect(getDaysRemaining('2020-01-01')).toBe(0);
    });

    it('formats ISO date to human readable string', () => {
      const formatted = formatDate('2026-11-14T00:00:00.000Z');
      expect(formatted).toMatch(/Nov/);
      expect(formatted).toMatch(/2026/);
    });
  });

  describe('Deterministic Fallback Engine', () => {
    it('generates high-craft vendor vetting questions and outreach scripts', () => {
      const vet = getLocalVendorVet('The Royal Palatial Decorators', 'decor', 250000);
      expect(vet.whatsappOutreachScript).toContain('The Royal Palatial Decorators');
      expect(vet.whatsappOutreachScript).toContain('decor');
      expect(vet.emailOutreachScript).toContain('Subject: Partnership Proposal');
      expect(vet.vettingQuestions.length).toBeGreaterThanOrEqual(5);
      expect(vet.hiddenCostRedFlags.length).toBeGreaterThanOrEqual(4);
    });

    it('generates culturally-tailored theme ideation for wedding modality', () => {
      const idea = getLocalThemeIdea('wedding', 'Royal Saffron Palatial');
      expect(idea.title).toBe('Regal Saffron & Ivory Heritage Serenade');
      expect(idea.colors.length).toBe(4);
      expect(idea.decorConcepts.length).toBeGreaterThanOrEqual(2);
      expect(idea.menuItems.length).toBeGreaterThanOrEqual(2);
      expect(idea.activities.length).toBeGreaterThanOrEqual(1);
    });

    it('generates modern minimalist theme ideation for non-wedding modalities', () => {
      const idea = getLocalThemeIdea('tech_conference', 'Minimalist Neon');
      expect(idea.title).toBe('Minimalist Monolith & Neon Noir');
      expect(idea.colors[0].name).toBe('Carbon Obsidian');
      expect(idea.decorConcepts.length).toBeGreaterThanOrEqual(2);
      expect(idea.menuItems.length).toBeGreaterThanOrEqual(2);
      expect(idea.activities.length).toBeGreaterThanOrEqual(1);
    });
  });
});


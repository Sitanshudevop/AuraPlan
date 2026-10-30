import { describe, it, expect } from 'vitest';
import { generateCustomPlan, generateRippleScenario } from '../services/geminiService';
import { getLocalVendorVet, getLocalThemeIdea } from '../services/deterministicFallback';
import { sanitizeInput } from '../utils/security';
import { workspaceReducer } from '../context/workspaceReducer';
import { EventWorkspaceState } from '../types/state';

const baseMockState: EventWorkspaceState = {
  event: {
    id: 'e-test',
    name: 'Gala Test Event',
    type: 'birthday',
    date: '2026-12-15',
    city: 'Mumbai',
    setting: 'indoor',
    guestCount: 80,
    targetBudget: 200000,
    currency: 'INR',
    culturalPreferences: 'Modern minimalist',
    subEvents: [],
  },
  budgetItems: [
    {
      id: 'b-1',
      category: 'venue',
      name: 'Rooftop Hall',
      allocated: 80000,
      actualContracted: 0,
      amountPaid: 0,
      vendorQuote: 0,
      isLocked: true,
      notes: '',
    },
    {
      id: 'b-2',
      category: 'catering',
      name: 'Buffet Catering',
      allocated: 50000,
      actualContracted: 0,
      amountPaid: 0,
      vendorQuote: 0,
      isLocked: false,
      notes: '',
    },
    {
      id: 'b-3',
      category: 'entertainment',
      name: 'DJ & Sound',
      allocated: 30000,
      actualContracted: 0,
      amountPaid: 0,
      vendorQuote: 0,
      isLocked: false,
      notes: '',
    },
  ],
  paymentMilestones: [],
  sponsorships: [],
  vendors: [],
  macroTasks: [],
  dayOfActivities: [],
  guests: [],
  zones: [],
  includeTaxInTotals: true,
  taxRatePercent: 18,
};

describe('Error Boundaries, Offline Fallbacks & Deep Sanitization', () => {
  it('generates fully populated plan offline when Gemini API key is unconfigured', async () => {
    const plan = await generateCustomPlan({
      name: 'Autumn Lakefront Soiree',
      type: 'wedding',
      date: '2026-11-20',
      city: 'Udaipur',
      setting: 'outdoor',
      guestCount: 200,
      targetBudget: 1500000,
      currency: 'INR',
      culturalPreferences: 'Vedic heritage',
    });

    expect(plan.event.name).toBe('Autumn Lakefront Soiree');
    expect(plan.budgetItems.length).toBeGreaterThan(1);
    expect(plan.vendors.length).toBeGreaterThanOrEqual(2);
    expect(plan.macroTasks.length).toBeGreaterThan(1);
  });

  it('generates structured offline vetting and negotiation guidance', () => {
    const vet = getLocalVendorVet('Grand Palace Banquets', 'venue', 450000);
    expect(vet.whatsappOutreachScript).toContain('Grand Palace Banquets');
    expect(vet.vettingQuestions.length).toBeGreaterThanOrEqual(4);
    expect(vet.hiddenCostRedFlags.length).toBeGreaterThanOrEqual(3);

    const theme = getLocalThemeIdea('wedding', 'Royal palatial');
    expect(theme.colors.length).toBeGreaterThanOrEqual(3);
    expect(theme.decorConcepts.length).toBeGreaterThanOrEqual(2);
  });

  it('generates ripple diff for guest surges and cancellations', async () => {
    const ripple = await generateRippleScenario('guest_surge_25', baseMockState);
    expect(ripple.scenarioTitle).toBeDefined();
    expect(ripple.netBudgetImpact).toBeGreaterThan(0);
    expect(ripple.budgetAdjustments.length).toBeGreaterThan(0);
  });

  it('sanitizes multi-nested XSS attack vectors safely', () => {
    const attack1 = '<script>alert("hack")</script>Royal Caterers';
    expect(sanitizeInput(attack1)).toBe('Royal Caterers');

    const attack2 = '<iframe src="evil.com"></iframe><b>Grand Ballroom</b>';
    expect(sanitizeInput(attack2)).toBe('Grand Ballroom');

    const attack3 = '<img src=x onerror=alert(1)>Photography & AV';
    expect(sanitizeInput(attack3)).toBe('Photography & AV');

    const attack4 = 'javascript:void(0) Custom Notes';
    expect(sanitizeInput(attack4)).toBe('Custom Notes');
  });

  it('auto-balances budget items gracefully without throwing when locked items exist', () => {
    const newState = workspaceReducer(baseMockState, { type: 'AUTO_BALANCE_BUDGET' });
    const lockedItem = newState.budgetItems.find((b) => b.id === 'b-1');
    const unlockedItem1 = newState.budgetItems.find((b) => b.id === 'b-2');
    const unlockedItem2 = newState.budgetItems.find((b) => b.id === 'b-3');

    // Locked item remains strictly 80,000
    expect(lockedItem?.allocated).toBe(80000);

    // Remaining 120,000 (200,000 - 80,000) is distributed proportionally between b-2 and b-3
    const totalAllocated = newState.budgetItems.reduce((acc, b) => acc + b.allocated, 0);
    expect(totalAllocated).toBe(200000);
    expect(unlockedItem1?.allocated).toBeGreaterThan(0);
    expect(unlockedItem2?.allocated).toBeGreaterThan(0);
  });
});

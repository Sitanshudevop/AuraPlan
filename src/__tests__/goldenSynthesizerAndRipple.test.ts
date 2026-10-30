import { describe, it, expect } from 'vitest';
import { calculateDeterministicRipple } from '../services/rippleEngine';
import { synthesizePlanLocally, NewEventFormInput } from '../services/planSynthesizer';
import { weddingPreset } from '../data/weddingPreset';

describe('Golden Characterization: Plan Synthesizer & Ripple Engine', () => {
  const sampleInput: NewEventFormInput = {
    name: 'Royal Heritage Gala',
    type: 'wedding',
    date: '2026-12-15',
    city: 'Jaipur',
    setting: 'indoor',
    guestCount: 200,
    targetBudget: 1000000,
    currency: 'INR',
    culturalPreferences: 'Rajasthani Royal',
  };

  it('synthesizes consistent plan state matching golden ratios', () => {
    const result = synthesizePlanLocally(sampleInput);

    expect(result.event.name).toBe('Royal Heritage Gala');
    expect(result.event.targetBudget).toBe(1000000);
    expect(result.event.guestCount).toBe(200);
    expect(result.budgetItems).toHaveLength(5);

    // Verify 35% venue, 30% catering, 15% decor, 10% photo, 10% buffer
    const venue = result.budgetItems.find((b) => b.category === 'venue');
    const catering = result.budgetItems.find((b) => b.category === 'catering');
    const decor = result.budgetItems.find((b) => b.category === 'decor');
    const photo = result.budgetItems.find((b) => b.category === 'av_photo');
    const buffer = result.budgetItems.find((b) => b.category === 'buffer');

    expect(venue?.allocated).toBe(350000);
    expect(catering?.allocated).toBe(300000);
    expect(decor?.allocated).toBe(150000);
    expect(photo?.allocated).toBe(100000);
    expect(buffer?.allocated).toBe(100000);

    expect(result.vendors).toHaveLength(2);
    expect(result.macroTasks).toHaveLength(3);
    expect(result.dayOfActivities).toHaveLength(3);
    expect(result.guests).toHaveLength(2);
    expect(result.zones).toHaveLength(2);
    expect(result.taxRatePercent).toBe(18);
    expect(result.includeTaxInTotals).toBe(true);
  });

  it('calculates deterministic ripple for guest surge (+25%) correctly', () => {
    const result = calculateDeterministicRipple('guest_surge_25', weddingPreset);

    expect(result.scenarioTitle).toBe('Guest Surge (+25% Headcount)');
    expect(result.guestCountImpact).toBe(Math.round(weddingPreset.event.guestCount * 0.25));
    expect(result.budgetAdjustments.length).toBeGreaterThanOrEqual(2);
    expect(result.timelineModifications).toHaveLength(2);
    expect(result.newVendors).toHaveLength(1);
    expect(result.netBudgetImpact).toBeGreaterThan(0);
  });

  it('calculates deterministic ripple for budget cut (-15%) correctly', () => {
    const result = calculateDeterministicRipple('cut_budget_15', weddingPreset);

    expect(result.scenarioTitle).toBe('-15% Budget Cut (Austerity Calibration)');
    expect(result.guestCountImpact).toBe(0);
    expect(result.netBudgetImpact).toBeLessThan(0);
    expect(result.budgetAdjustments.length).toBe(3);
  });

  it('calculates deterministic ripple for monsoon warning correctly', () => {
    const result = calculateDeterministicRipple('monsoon_warning', weddingPreset);

    expect(result.scenarioTitle).toContain('Monsoon');
    expect(result.budgetAdjustments.length).toBeGreaterThan(0);
  });

  it('calculates deterministic ripple for inflation spike correctly', () => {
    const result = calculateDeterministicRipple('inflation_spike_20', weddingPreset);

    expect(result.scenarioTitle).toContain('Inflation');
    expect(result.budgetAdjustments.length).toBeGreaterThan(0);
  });
});

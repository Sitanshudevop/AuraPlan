import { describe, it, expect } from 'vitest';
import { weddingPreset } from '../data/weddingPreset';
import { birthdayPreset } from '../data/birthdayPreset';
import { communityPreset } from '../data/communityPreset';
import { detectScheduleConflicts } from '../features/timeline/ConflictDetector';
import { generateRippleScenario } from '../services/geminiService';
import { getLocalVendorVet, getLocalThemeIdea } from '../services/deterministicFallback';
import { calculatePerHeadBudget, calculatePerPlateTotal } from '../features/budget/budgetMath';

describe('F10 Alignment: PromptWars Challenge 5 Pillars & Modalities', () => {
  it('validates 3 distinct modalities: Wedding, Birthday, and Community Summit', () => {
    // 1. Wedding: Udaipur Heritage Wedding
    expect(weddingPreset.event.type).toBe('wedding');
    expect(weddingPreset.event.guestCount).toBe(250);
    expect(weddingPreset.event.subEvents?.length).toBeGreaterThan(0);
    expect(weddingPreset.vendors.length).toBeGreaterThanOrEqual(10);

    // 2. Milestone Birthday: Botanical 25th Gala
    expect(birthdayPreset.event.type).toBe('birthday');
    expect(birthdayPreset.event.guestCount).toBe(65);
    expect(birthdayPreset.budgetItems.some((b) => b.category === 'catering')).toBe(true);

    // 3. Community Summit: Open-Source AI Builders
    expect(communityPreset.event.type).toBe('community');
    expect(communityPreset.event.guestCount).toBe(400);
    expect(communityPreset.event.targetBudget).toBeGreaterThan(0);
  });

  it('validates financial reconciliation math and per-plate scaling', () => {
    const perHead = calculatePerHeadBudget(1850000, 250);
    expect(perHead).toBe(7400);

    const plateTotal = calculatePerPlateTotal(2200, 250);
    expect(plateTotal).toBe(550000);
  });

  it('validates conflict detection on overlapping venue / POC activities', () => {
    const activities = [
      {
        id: 'act-1',
        title: 'Varmala Ceremony',
        startTime: '18:00',
        endTime: '19:00',
        durationMinutes: 60,
        locationZone: 'Central Stage',
        poc: 'Coordinator A',
      },
      {
        id: 'act-2',
        title: 'Photoshoot',
        startTime: '18:30',
        endTime: '19:30',
        durationMinutes: 60,
        locationZone: 'Central Stage', // conflict: same location
        poc: 'Coordinator B',
      },
    ];

    const conflicts = detectScheduleConflicts(activities);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].reason).toBe('location');
    expect(conflicts[0].conflictDetail).toContain('Central Stage');
  });

  it('validates 100% deterministic local offline engines for all AI capabilities', async () => {
    // 1. Theme Generator fallback
    const theme = getLocalThemeIdea('wedding', 'Royal Heritage');
    expect(theme.title).toBeDefined();
    expect(theme.colors.length).toBeGreaterThanOrEqual(3);

    // 2. Vendor Vet fallback
    const vet = getLocalVendorVet('Palace Caterers', 'Catering', 450000);
    expect(vet.vettingQuestions.length).toBeGreaterThan(0);
    expect(vet.hiddenCostRedFlags.length).toBeGreaterThan(0);

    // 3. Ripple Scenario fallback
    const ripple = await generateRippleScenario('guest_surge_25', weddingPreset);
    expect(ripple.budgetAdjustments.length).toBeGreaterThan(0);
    expect(ripple.summaryRationale).toContain('additional guests');
  });
});

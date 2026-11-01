import { describe, it, expect } from 'vitest';
import { Guest, ZoneCapacity } from '../types/guest';
import { Vendor } from '../types/vendor';
import { DayOfActivity } from '../types/timeline';
import { BudgetItem } from '../types/budget';
import { calculatePerHeadBudget, calculatePerPlateTotal } from '../features/budget/budgetMath';
import { budgetReducer } from '../state/budgetReducer';
import { detectScheduleConflicts } from '../features/timeline/ConflictDetector';

describe('Stress & Scalability Performance Benchmark Suite (F7)', () => {
  it('measures calculation time for 1,000 and 5,000 guests and asserts < 50ms', () => {
    // Generate 5,000 guests
    const guests: Guest[] = Array.from({ length: 5000 }, (_, i) => ({
      id: `guest-${i}`,
      name: `Guest ${i}`,
      group: (['bride', 'groom', 'vip', 'general'] as const)[i % 4],
      rsvp: (['confirmed', 'declined', 'pending'] as const)[i % 3],
      plusOnes: i % 4,
      tableOrZoneId: `zone-${i % 5}`,
      dietary: (['vegetarian', 'vegan', 'regular'] as const)[i % 3],
    }));

    const mockZones: ZoneCapacity[] = Array.from({ length: 5 }, (_, i) => ({
      id: `zone-${i}`,
      name: `Zone ${i}`,
      maxCapacity: 1200,
      assignedCount: 0,
      type: 'zone',
    }));

    const start = performance.now();

    // 1. Dietary aggregation
    const dietaryCounts = guests.reduce((acc, g) => {
      acc[g.dietary] = (acc[g.dietary] || 0) + 1 + g.plusOnes;
      return acc;
    }, {} as Record<string, number>);

    // 2. Zone capacity aggregation
    const zoneUsage = guests.reduce((acc, g) => {
      if (g.tableOrZoneId) {
        acc[g.tableOrZoneId] = (acc[g.tableOrZoneId] || 0) + 1 + g.plusOnes;
      }
      return acc;
    }, {} as Record<string, number>);
    mockZones.forEach((z) => {
      z.assignedCount = zoneUsage[z.id] || 0;
    });

    // 3. Per head calculation for 5,000 guests
    const perHead = calculatePerHeadBudget(50000000, 5000);
    const cateringTotal = calculatePerPlateTotal(2500, 5000);

    // 4. Budget auto-balance with 5,000 guest budget
    const budgetItems: BudgetItem[] = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      category: 'catering',
      name: `Catering Item ${i}`,
      allocated: 100000,
      vendorQuote: 120000,
      actualContracted: 110000,
      amountPaid: 50000,
      isLocked: i % 5 === 0,
    }));

    const balanced = budgetReducer(
      { budgetItems, includeTaxInTotals: false, taxRatePercent: 18 },
      { type: 'AUTO_BALANCE_BUDGET' },
      cateringTotal
    );

    const elapsed = performance.now() - start;

    expect(guests.length).toBe(5000);
    expect(dietaryCounts['vegetarian']).toBeGreaterThan(0);
    expect(zoneUsage['zone-0']).toBeGreaterThan(0);
    expect(perHead).toBe(10000);
    expect(cateringTotal).toBe(12500000);
    expect(balanced.budgetItems.length).toBe(50);
    expect(elapsed).toBeLessThan(50);
  });

  it('handles 200 vendors filtering and calculations under 50ms', () => {
    const vendors: Vendor[] = Array.from({ length: 200 }, (_, i) => ({
      id: `v-${i}`,
      name: `Vendor ${i}`,
      category: (['catering', 'av_photo', 'venue', 'entertainment', 'decor'] as const)[i % 5],
      status: (['shortlisted', 'contacted', 'quote_received', 'contract_signed', 'paid'] as const)[i % 5],
      estimatedPrice: 100000 + i * 1000,
      contractedPrice: 95000 + i * 1000,
      paidAmount: 20000,
      contactName: `Vendor Contact ${i}`,
      phone: '1234567890',
      email: `vendor${i}@example.com`,
      rating: 4.5,
      ratingCount: 10,
      location: 'City Center',
      notes: 'Notes',
      deliverables: ['Item A', 'Item B'],
    }));

    const start = performance.now();
    const categories = Array.from(new Set(vendors.map((v) => v.category)));
    const cateringVendors = vendors.filter((v) => v.category === 'catering');
    const totalCommitted = vendors
      .filter((v) => v.status === 'contract_signed' || v.status === 'paid')
      .reduce((sum, v) => sum + (v.contractedPrice || v.estimatedPrice), 0);

    const duration = performance.now() - start;

    expect(categories.length).toBe(5);
    expect(cateringVendors.length).toBe(40);
    expect(totalCommitted).toBeGreaterThan(0);
    expect(duration).toBeLessThan(50);
  });

  it('handles 500 timeline events with conflict detection under 50ms', () => {
    const activities: DayOfActivity[] = Array.from({ length: 500 }, (_, i) => {
      const hour = String(Math.floor(i / 60) % 24).padStart(2, '0');
      const min = String(i % 60).padStart(2, '0');
      const nextMin = String((i + 15) % 60).padStart(2, '0');
      return {
        id: `act-${i}`,
        title: `Activity ${i}`,
        startTime: `${hour}:${min}`,
        endTime: `${hour}:${nextMin}`,
        durationMinutes: 15,
        locationZone: `Hall ${i % 3}`,
        poc: `Coordinator ${i % 5}`,
      };
    });

    const start = performance.now();
    const conflicts = detectScheduleConflicts(activities);
    const duration = performance.now() - start;

    expect(activities.length).toBe(500);
    expect(conflicts).toBeDefined();
    expect(duration).toBeLessThan(50);
  });
});

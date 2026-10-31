import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RippleScenarioSelector } from '../features/ideation/RippleScenarioSelector';
import { RippleDiffSummary } from '../features/ideation/RippleDiffSummary';
import { RippleDiffResult } from '../types/ripple';

describe('Ripple Scenario Selector and Diff Summary UI Components', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  const mockDiff: RippleDiffResult = {
    scenarioTitle: 'Surprise Monsoon Alert',
    scenarioDescription: 'Heavy rains require waterproof canopies and backup generators.',
    netBudgetImpact: 65000,
    guestCountImpact: 0,
    summaryRationale: 'Monsoon mitigation measures required immediately.',
    budgetAdjustments: [
      { category: 'decor', categoryLabel: 'Decor & Canopies', oldAllocated: 50000, newAllocated: 95000, diff: 45000, reason: 'Waterproof marquee tents' },
      { category: 'logistics', categoryLabel: 'Logistics & Power', oldAllocated: 30000, newAllocated: 50000, diff: 20000, reason: 'Dual diesel generators' },
    ],
    newVendors: [
      { id: 'v-new-1', name: 'Monsoon Proofing Ltd', category: 'decor', estimatedCost: 30000, justification: 'High-speed tent anchoring' },
    ],
    timelineModifications: [
      { id: 't-mod-1', action: 'add', title: 'Pre-check generator wiring', detail: '3 hours prior to guest arrival', horizonOrDayOf: 'Day of Event' },
    ],
  };

  it('RippleScenarioSelector renders scenario presets, switches preset, and handles custom input', () => {
    const handleSelectPreset = vi.fn();
    const handleCustomChange = vi.fn();
    const handleSimulateCustom = vi.fn();

    const { rerender } = render(
      <RippleScenarioSelector
        selectedPreset="guest_surge_25"
        onSelectPreset={handleSelectPreset}
        customPrompt=""
        onCustomPromptChange={handleCustomChange}
        onSimulateCustom={handleSimulateCustom}
      />
    );

    expect(screen.getByText(/Stress scenarios/i)).toBeInTheDocument();
    const presetBtn = screen.getByRole('button', { name: /\+25% Guest Surge/i });
    expect(presetBtn).toBeInTheDocument();
    fireEvent.click(presetBtn);
    expect(handleSelectPreset).toHaveBeenCalledWith('guest_surge_25');

    const simulateBtn = screen.getByRole('button', { name: /Simulate/i });
    expect(simulateBtn).toBeDisabled();

    rerender(
      <RippleScenarioSelector
        selectedPreset="guest_surge_25"
        onSelectPreset={handleSelectPreset}
        customPrompt="Unexpected VIP security arrival"
        onCustomPromptChange={handleCustomChange}
        onSimulateCustom={handleSimulateCustom}
      />
    );

    expect(simulateBtn).not.toBeDisabled();
    fireEvent.click(simulateBtn);
    expect(handleSimulateCustom).toHaveBeenCalled();
  });

  it('RippleDiffSummary renders scenario details, net impact badges, and impacted item lists', () => {
    render(<RippleDiffSummary diffResult={mockDiff} currency="INR" />);

    expect(screen.getByText('Surprise Monsoon Alert')).toBeInTheDocument();
    expect(screen.getByText(/Waterproof marquee tents/i)).toBeInTheDocument();
    expect(screen.getByText('Monsoon Proofing Ltd')).toBeInTheDocument();
    expect(screen.getByText('Pre-check generator wiring')).toBeInTheDocument();

    // Net budget impact with + sign and badge
    expect(screen.getByText('+₹65,000')).toBeInTheDocument();
    expect(screen.getByText('Budget increase')).toBeInTheDocument();
  });

  it('RippleDiffSummary renders cost savings badge when net budget impact is negative', () => {
    const savingsDiff: RippleDiffResult = {
      ...mockDiff,
      scenarioTitle: 'Vendor Consolidation Discount',
      netBudgetImpact: -25000,
      budgetAdjustments: [
        { category: 'decor', categoryLabel: 'Decor & Florals', oldAllocated: 50000, newAllocated: 25000, diff: -25000, reason: 'Bundled package discount' },
      ],
      newVendors: [],
      timelineModifications: [],
    };

    render(<RippleDiffSummary diffResult={savingsDiff} currency="INR" />);

    expect(screen.getByText('Cost savings')).toBeInTheDocument();
    expect(screen.getByText(/Bundled package discount/i)).toBeInTheDocument();
  });
});

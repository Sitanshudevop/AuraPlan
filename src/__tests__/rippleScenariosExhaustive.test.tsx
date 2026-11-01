import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { RippleSimulatorDrawer } from '../features/ideation/RippleSimulatorDrawer';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { RipplePresetId } from '../types/ripple';
import { calculateDeterministicRipple } from '../services/rippleEngine';
import { INITIAL_PRESETS } from '../data/presets';

describe('Ripple Scenarios Exhaustive Execution & Simulator Interactions (F7)', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('runs all defined ripple preset scenarios through the deterministic engine', () => {
    const weddingState = INITIAL_PRESETS['preset-wedding-udaipur'];
    const birthdayState = INITIAL_PRESETS['preset-birthday-botanical'];
    const summitState = INITIAL_PRESETS['preset-community-builders'];
    const presets: RipplePresetId[] = ['guest_surge_25', 'cut_budget_15', 'monsoon_warning', 'inflation_spike_20'];

    for (const preset of presets) {
      const diff1 = calculateDeterministicRipple(preset, weddingState);
      expect(diff1).toBeDefined();
      expect(diff1.scenarioTitle).toBeDefined();
      expect(diff1.budgetAdjustments.length).toBeGreaterThan(0);

      const diff2 = calculateDeterministicRipple(preset, birthdayState);
      expect(diff2).toBeDefined();

      const diff3 = calculateDeterministicRipple(preset, summitState);
      expect(diff3).toBeDefined();
    }
  });

  it('exercises RippleSimulatorDrawer open, scenario selection, and applying changes', async () => {
    const TestRippleApp: React.FC = () => {
      const { setCopilotOpen } = useWorkspace();
      return (
        <div>
          <button onClick={() => setCopilotOpen(true)}>Open Ripple</button>
          <RippleSimulatorDrawer />
        </div>
      );
    };

    render(
      <WorkspaceProvider>
        <TestRippleApp />
      </WorkspaceProvider>
    );

    fireEvent.click(screen.getByText('Open Ripple'));

    // Find preset button '+25% Guest Surge' and click it to run simulation
    const surgeBtn = screen.getByText('+25% Guest Surge');
    await act(async () => {
      fireEvent.click(surgeBtn);
    });

    // Find apply button and click it
    const applyBtn = screen.getByRole('button', { name: /Apply to plan/i });
    await waitFor(() => {
      expect(applyBtn).not.toBeDisabled();
    });
    act(() => {
      fireEvent.click(applyBtn);
    });
  });
});


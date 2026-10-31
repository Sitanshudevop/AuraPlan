import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { PlanningAssistantDrawer } from '../features/copilot/PlanningAssistantDrawer';
import { askPlanningAssistant } from '../services/planningAssistantService';
import { INITIAL_PRESETS } from '../data/presets';

describe('Problem Statement Alignment: Planning Assistant & Drawer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('GenAI Planning Assistant & Local Deterministic Engine', () => {
    const weddingEvent = INITIAL_PRESETS['preset-wedding-udaipur'].event;
    const dummyState = INITIAL_PRESETS['preset-wedding-udaipur'];

    it('returns structured weather contingency advice and action payloads', async () => {
      const res = await askPlanningAssistant('What should we do for rain contingency?', weddingEvent, dummyState);
      expect(res.role).toBe('assistant');
      expect(res.content).toMatch(/Weather Trigger Window/i);
      expect(res.suggestedActions?.length).toBeGreaterThan(0);
      expect(res.suggestedActions?.[0].type).toBe('add_task');
    });

    it('returns buffer recommendations between Baraat and Varmala', async () => {
      const res = await askPlanningAssistant('buffer time between Baraat and Varmala', weddingEvent, dummyState);
      expect(res.content).toMatch(/30–45 minutes/i);
      expect(res.suggestedActions?.[0].label).toMatch(/Varmala Buffer/i);
    });

    it('returns municipal permit guidance for community events', async () => {
      const communityEvent = INITIAL_PRESETS['preset-community-builders'].event;
      const res = await askPlanningAssistant('What permits are needed?', communityEvent, dummyState);
      expect(res.content).toMatch(/Fire Department NOC/i);
      expect(res.content).toMatch(/Sound License/i);
    });
  });

  describe('Interactive Planning Assistant Drawer Component', () => {
    const TestConsumer = () => {
      const { setAssistantOpen } = useWorkspace();
      return (
        <div>
          <button data-testid="open-assistant-btn" onClick={() => setAssistantOpen(true)}>
            Open Assistant
          </button>
          <PlanningAssistantDrawer />
        </div>
      );
    };

    it('opens dialog, renders quick chips, and sends queries with 1-click state application', async () => {
      render(
        <WorkspaceProvider>
          <TestConsumer />
        </WorkspaceProvider>
      );

      fireEvent.click(screen.getByTestId('open-assistant-btn'));
      expect(screen.getByRole('dialog', { name: /AuraPlan AI Planning Assistant/i })).toBeInTheDocument();

      const chips = screen.getAllByRole('button', { name: /What buffer time is needed/i });
      expect(chips.length).toBeGreaterThan(0);
      fireEvent.click(chips[0]);

      await waitFor(() => {
        expect(screen.getByText(/30–45 minutes/i)).toBeInTheDocument();
      });

      const actionBtn = screen.getByRole('button', { name: /\+ Add Varmala Buffer Task/i });
      fireEvent.click(actionBtn);

      await waitFor(() => {
        expect(screen.getByText(/Applied to Plan ✓/i)).toBeInTheDocument();
      });
    });
  });
});


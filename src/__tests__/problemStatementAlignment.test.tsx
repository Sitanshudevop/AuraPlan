import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { VendorChecklistView } from '../features/vendors/VendorChecklistView';
import { PersonalizedActivitiesView } from '../features/ideation/PersonalizedActivitiesView';
import { PlanningAssistantDrawer } from '../features/copilot/PlanningAssistantDrawer';
import { askPlanningAssistant } from '../services/planningAssistantService';
import { INITIAL_PRESETS } from '../data/presets';

describe('Problem Statement Alignment: Challenge 5 Celebration & Event Planner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Modality Vendor Checklists (Weddings, Birthdays, Community)', () => {
    it('renders wedding vendor requirements with contracted, sourced, and missing status indicators', () => {
      const weddingState = INITIAL_PRESETS['preset-wedding-udaipur'];
      const onOpenNeg = vi.fn();
      const onAdd = vi.fn();

      render(
        <VendorChecklistView
          vendors={weddingState.vendors}
          currency="INR"
          eventType="wedding"
          onOpenNegotiation={onOpenNeg}
          onAddVendor={onAdd}
        />
      );

      expect(screen.getByText(/WEDDING Essential Vendor Checklist/i)).toBeInTheDocument();
      expect(screen.getByText(/Venue & Heritage Lawn/i)).toBeInTheDocument();
      expect(screen.getByText(/Catering & Banquets/i)).toBeInTheDocument();
      expect(screen.getByText(/Mandap & Floral Decor/i)).toBeInTheDocument();
      expect(screen.getByText(/Covered/i)).toBeInTheDocument();
    });

    it('allows quick-sourcing missing vendors with default budget estimates', () => {
      const onOpenNeg = vi.fn();
      const onAdd = vi.fn();

      render(
        <VendorChecklistView
          vendors={[]}
          currency="INR"
          eventType="birthday"
          onOpenNegotiation={onOpenNeg}
          onAddVendor={onAdd}
        />
      );

      expect(screen.getByText(/BIRTHDAY Essential Vendor Checklist/i)).toBeInTheDocument();
      const sourceButtons = screen.getAllByRole('button', { name: /Source Vendor/i });
      expect(sourceButtons.length).toBeGreaterThan(0);

      fireEvent.click(sourceButtons[0]);
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'venue',
          status: 'shortlisted',
        })
      );
    });
  });

  describe('Personalized Activity & Entertainment Itinerary Ideas', () => {
    it('renders modality-specific experiential moments for all 3 event types', () => {
      const onAddToTimeline = vi.fn();
      const onAddToBudget = vi.fn();

      const { rerender } = render(
        <PersonalizedActivitiesView
          eventType="wedding"
          currency="INR"
          onAddToTimeline={onAddToTimeline}
          onAddToBudget={onAddToBudget}
        />
      );

      expect(screen.getByText(/Baraat Grand Entry Flash Mob/i)).toBeInTheDocument();
      expect(screen.getByText(/Sangeet Dance-Off/i)).toBeInTheDocument();

      rerender(
        <PersonalizedActivitiesView
          eventType="birthday"
          currency="INR"
          onAddToTimeline={onAddToTimeline}
          onAddToBudget={onAddToBudget}
        />
      );
      expect(screen.getByText(/Retro Arcade High-Score Tournament/i)).toBeInTheDocument();

      rerender(
        <PersonalizedActivitiesView
          eventType="community"
          currency="INR"
          onAddToTimeline={onAddToTimeline}
          onAddToBudget={onAddToBudget}
        />
      );
      expect(screen.getByText(/Community Collaborative Mural Canvas/i)).toBeInTheDocument();
    });

    it('injects personalized activities into timeline and budget with 1 click', () => {
      const onAddToTimeline = vi.fn();
      const onAddToBudget = vi.fn();

      render(
        <PersonalizedActivitiesView
          eventType="wedding"
          currency="INR"
          onAddToTimeline={onAddToTimeline}
          onAddToBudget={onAddToBudget}
        />
      );

      const timelineBtn = screen.getAllByRole('button', { name: /\+ Run-of-Show/i })[0];
      fireEvent.click(timelineBtn);
      expect(onAddToTimeline).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Baraat Grand Entry Flash Mob' })
      );

      const budgetBtn = screen.getAllByRole('button', { name: /\+ Budget/i })[0];
      fireEvent.click(budgetBtn);
      expect(onAddToBudget).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Baraat Grand Entry Flash Mob', estimatedCost: 45000 })
      );
    });
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

      // Quick chip clicks
      const chips = screen.getAllByRole('button', { name: /What buffer time is needed/i });
      expect(chips.length).toBeGreaterThan(0);
      fireEvent.click(chips[0]);

      await waitFor(() => {
        expect(screen.getByText(/30–45 minutes/i)).toBeInTheDocument();
      });

      // 1-Click action injection
      const actionBtn = screen.getByRole('button', { name: /\+ Add Varmala Buffer Task/i });
      fireEvent.click(actionBtn);

      await waitFor(() => {
        expect(screen.getByText(/Applied to Plan ✓/i)).toBeInTheDocument();
      });
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VendorChecklistView } from '../features/vendors/VendorChecklistView';
import { PersonalizedActivitiesView } from '../features/ideation/PersonalizedActivitiesView';
import { INITIAL_PRESETS } from '../data/presets';

describe('Problem Statement Alignment: Checklists & Personalized Activities', () => {
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
});

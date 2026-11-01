import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { App } from '../App';

describe('App Global Workspace Integration Flows (F7)', () => {
  beforeAll(async () => {
    await Promise.all([
      import('../features/budget/BudgetTab'),
      import('../features/guests/GuestsTab'),
      import('../features/vendors/VendorsTab'),
      import('../features/timeline/TimelineTab'),
      import('../features/ideation/IdeationTab'),
      import('../features/copilot/PlanningAssistantDrawer'),
    ]);
  });

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders application shell with header, sidebar, skip link, and default dashboard tab', () => {
    render(<App />);
    expect(screen.getByText('Skip to main workspace')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: /Workspace Navigation/i })).toBeInTheDocument();
  });

  it('navigates between feature tabs via navigation buttons', async () => {
    render(<App />);

    // Switch to Budget tab
    const budgetBtn = screen.getByRole('button', { name: 'Smart Budget Engine' });
    fireEvent.click(budgetBtn);
    expect(await screen.findByText(/Financial-Grade Smart Budget Engine/i, {}, { timeout: 6000 })).toBeInTheDocument();

    // Switch to Guests tab
    const guestsBtn = screen.getByRole('button', { name: 'Guests & Capacity Matrix' });
    fireEvent.click(guestsBtn);
    expect(await screen.findByRole('button', { name: /Add guest/i }, { timeout: 6000 })).toBeInTheDocument();

    // Switch to Vendors tab
    const vendorsBtn = screen.getByRole('button', { name: 'Vendor CRM & Studio' });
    fireEvent.click(vendorsBtn);
    expect(await screen.findByRole('button', { name: /Add vendor/i }, { timeout: 6000 })).toBeInTheDocument();

    // Switch to Timeline tab
    const timelineBtn = screen.getByRole('button', { name: 'Timeline & Run-of-Show' });
    fireEvent.click(timelineBtn);
    expect(await screen.findByText(/Timeline & Run-of-Show/i, {}, { timeout: 6000 })).toBeInTheDocument();

    // Switch to Ideation tab
    const ideationBtn = screen.getByRole('button', { name: 'AI Ideation & Themes' });
    fireEvent.click(ideationBtn);
    expect(await screen.findByText(/Personalized AI Ideation/i, {}, { timeout: 6000 })).toBeInTheDocument();
  });

  it('opens and closes Command Palette via search trigger and Escape', async () => {
    render(<App />);

    const searchBtn = screen.getByRole('button', { name: /Search workspace/i });
    fireEvent.click(searchBtn);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Command Palette/i })).toBeInTheDocument();
    });

    // Press Escape to close Command Palette
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Command Palette/i })).not.toBeInTheDocument();
    });
  });

  it('opens and closes Assistant drawer from header actions', async () => {
    render(<App />);

    const assistantTrigger = screen.getByTitle('Open AI Planning Assistant');
    fireEvent.click(assistantTrigger);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /AuraPlan AI Planning Assistant/i })).toBeInTheDocument();
    }, { timeout: 5000 });

    const closeBtn = screen.getByRole('button', { name: /Close assistant/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /AuraPlan AI Planning Assistant/i })).not.toBeInTheDocument();
    });
  });
});

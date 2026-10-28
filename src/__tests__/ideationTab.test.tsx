import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { IdeationTab } from '../features/ideation/IdeationTab';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';

describe('IdeationTab & ThemeConceptCard Progressive Disclosure', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('renders IdeationTab and generates theme concept with swatches', async () => {
    render(
      <WorkspaceProvider>
        <IdeationTab />
      </WorkspaceProvider>
    );

    expect(screen.getByText(/Personalized AI Ideation Studio & Theme Engine/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe your design preference/i)).toBeInTheDocument();

    // Wait for deterministic theme to populate
    const paletteTab = await screen.findByRole('button', { name: /Palette/i });
    expect(paletteTab).toBeInTheDocument();
  });

  it('navigates between Palette, Decor, and Menus progressive disclosure tabs', async () => {
    render(
      <WorkspaceProvider>
        <IdeationTab />
      </WorkspaceProvider>
    );

    const decorTab = await screen.findByRole('button', { name: /Decor/i });
    fireEvent.click(decorTab);

    // Decor panel should now have Add to Plan buttons
    const addButtons = screen.getAllByRole('button', { name: /Add to Plan/i });
    expect(addButtons.length).toBeGreaterThan(0);

    const menusTab = screen.getByRole('button', { name: /Menus/i });
    fireEvent.click(menusTab);

    // Menus panel should now display per head costs
    expect(screen.getAllByText(/\/ head/i).length).toBeGreaterThan(0);
  });

  it('allows copying hex code from color swatches', async () => {
    render(
      <WorkspaceProvider>
        <IdeationTab />
      </WorkspaceProvider>
    );

    const swatches = await screen.findAllByTitle(/Click to copy/i);
    expect(swatches.length).toBeGreaterThan(0);

    fireEvent.click(swatches[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('allows injecting decor concept into budget and timeline', async () => {
    render(
      <WorkspaceProvider>
        <IdeationTab />
      </WorkspaceProvider>
    );

    const decorTab = await screen.findByRole('button', { name: /Decor/i });
    fireEvent.click(decorTab);

    const addButtons = screen.getAllByRole('button', { name: /Add to Plan/i });
    expect(addButtons.length).toBeGreaterThan(0);

    act(() => {
      fireEvent.click(addButtons[0]);
    });

    expect(screen.getByText('Added')).toBeInTheDocument();
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '../App';
import { clearPersistedState } from '../utils/storage';

describe('CommandPalette Keyboard Navigation and Execution', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
    clearPersistedState();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('opens via search button and closes with Escape key', async () => {
    render(<App />);

    const searchBtn = screen.getByRole('button', { name: /Search or run command/i });
    fireEvent.click(searchBtn);

    const dialog = await screen.findByRole('dialog', { name: /Command Palette/i });
    expect(dialog).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Command Palette/i })).not.toBeInTheDocument();
    });
  });

  it('filters commands, navigates with Arrow keys, and executes on Enter', async () => {
    render(<App />);

    // Open via Ctrl+K / Cmd+K
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    await screen.findByRole('dialog', { name: /Command Palette/i });

    const input = screen.getByPlaceholderText(/Type a command/i);
    fireEvent.change(input, { target: { value: 'Negotiation Studio' } });

    // Verify option is rendered
    const options = await screen.findAllByRole('option');
    expect(options.length).toBeGreaterThan(0);

    // Navigate with ArrowDown
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowUp' });

    // Execute with Enter
    fireEvent.keyDown(window, { key: 'Enter' });

    // Dialog closes
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Command Palette/i })).not.toBeInTheDocument();
    });

    // Check tab transitioned to vendors
    await waitFor(
      () => {
        expect(screen.getByText(/Category Checklist/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it('shows empty state when no matching command is found', async () => {
    render(<App />);

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    await screen.findByRole('dialog', { name: /Command Palette/i });

    const input = screen.getByPlaceholderText(/Type a command/i);
    fireEvent.change(input, { target: { value: 'NON_EXISTENT_COMMAND_XYZ' } });

    expect(await screen.findByText(/No matching actions, vendors, or tasks found/i)).toBeInTheDocument();
  });

  it('executes item action and closes palette when an option is clicked directly', async () => {
    render(<App />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await screen.findByRole('dialog', { name: /Command Palette/i });

    const input = screen.getByPlaceholderText(/Type a command/i);
    fireEvent.change(input, { target: { value: 'Smart Budget Engine' } });

    const budgetOption = await screen.findByRole('option', { name: /Go to Smart Budget Engine/i });
    fireEvent.click(budgetOption);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Command Palette/i })).not.toBeInTheDocument();
    });

    // Verify budget tab opened
    await waitFor(
      () => {
        expect(screen.getByText(/Financial-Grade Smart Budget Engine/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});

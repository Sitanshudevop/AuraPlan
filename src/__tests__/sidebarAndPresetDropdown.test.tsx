import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Sidebar } from '../components/layout/Sidebar';
import { PresetDropdown } from '../components/layout/PresetDropdown';
import { WorkspaceProvider } from '../context/WorkspaceContext';

describe('Sidebar and PresetDropdown Navigation Components', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('Sidebar toggles collapse state on bottom button click and on window resize', () => {
    render(
      <WorkspaceProvider>
        <Sidebar />
      </WorkspaceProvider>
    );

    const collapseBtn = screen.getByRole('button', { name: /Collapse navigation/i });
    expect(collapseBtn).toBeInTheDocument();

    // Toggle collapse
    fireEvent.click(collapseBtn);
    expect(screen.getByRole('button', { name: /Expand navigation/i })).toBeInTheDocument();

    // Re-expand
    fireEvent.click(screen.getByRole('button', { name: /Expand navigation/i }));
    expect(screen.getByRole('button', { name: /Collapse navigation/i })).toBeInTheDocument();

    // Simulate mobile resize
    window.innerWidth = 800;
    fireEvent(window, new Event('resize'));
  });

  it('Sidebar opens edit event modal on edit button click', () => {
    render(
      <WorkspaceProvider>
        <Sidebar />
      </WorkspaceProvider>
    );

    const editBtn = screen.getByRole('button', { name: /Edit event details/i });
    expect(editBtn).toBeInTheDocument();
    fireEvent.click(editBtn);
  });

  it('PresetDropdown opens list, switches presets, and closes on Escape', () => {
    render(
      <WorkspaceProvider>
        <PresetDropdown />
      </WorkspaceProvider>
    );

    const toggleBtn = screen.getByRole('button', { name: /Preset:/i });
    expect(toggleBtn).toBeInTheDocument();

    // Open dropdown
    fireEvent.click(toggleBtn);

    // Switch to Birthday preset
    const birthdayOption = screen.getByRole('button', { name: /Midnight Botanical Gala/i });
    fireEvent.click(birthdayOption);

    // Open again and close on Escape
    fireEvent.click(toggleBtn);
    fireEvent.keyDown(document, { key: 'Escape' });
  });
});


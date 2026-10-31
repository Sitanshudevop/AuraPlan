import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { NewEventModal } from '../components/modals/NewEventModal';
import { HeaderActionsMenu } from '../components/layout/HeaderActionsMenu';
import { WorkspaceProvider } from '../context/WorkspaceContext';

describe('NewEventModal and HeaderActionsMenu Interactions', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('NewEventModal validates required fields and blocks submission with empty name/city', async () => {
    render(
      <WorkspaceProvider>
        <NewEventModalTriggerHelper />
      </WorkspaceProvider>
    );

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Open Modal/i }));
    expect(screen.getByText('Create event plan')).toBeInTheDocument();

    const form = screen.getByRole('dialog').querySelector('form')!;
    fireEvent.submit(form);

    // Error alert displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Event Name and City are required/i);
    });
  });

  it('NewEventModal validates positive budget and guest count', async () => {
    render(
      <WorkspaceProvider>
        <NewEventModalTriggerHelper />
      </WorkspaceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Open Modal/i }));

    // Set name and city
    const nameInput = screen.getByLabelText(/Event name/i);
    fireEvent.change(nameInput, { target: { value: 'Jaipur Palace Gala' } });

    const cityInput = screen.getByLabelText(/City \/ destination/i);
    fireEvent.change(cityInput, { target: { value: 'Jaipur' } });

    // Set negative budget
    const budgetInput = screen.getByLabelText(/Target budget/i);
    fireEvent.change(budgetInput, { target: { value: '-5000' } });

    const form = screen.getByRole('dialog').querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/positive numbers/i);
    });
  });

  it('HeaderActionsMenu opens dropdown, executes actions, and closes on Escape', () => {
    const handleToggleDark = vi.fn();
    const handleOpenCopilot = vi.fn();
    const handleOpenAudit = vi.fn();
    const handleExportJson = vi.fn();

    render(
      <HeaderActionsMenu
        isDark={false}
        toggleDarkMode={handleToggleDark}
        openCopilot={handleOpenCopilot}
        openAuditDrawer={handleOpenAudit}
        onExportJson={handleExportJson}
      />
    );

    const menuBtn = screen.getByRole('button', { name: /More actions/i });
    fireEvent.click(menuBtn);

    // Click toggle dark mode
    const darkBtn = screen.getByRole('button', { name: /Toggle dark mode/i });
    fireEvent.click(darkBtn);
    expect(handleToggleDark).toHaveBeenCalled();

    // Click export JSON
    fireEvent.click(menuBtn);
    const exportBtn = screen.getByRole('button', { name: /Export Workspace JSON Backup/i });
    fireEvent.click(exportBtn);
    expect(handleExportJson).toHaveBeenCalled();

    // Close on Escape
    fireEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
  });
});

import { useWorkspace } from '../context/WorkspaceContext';

function NewEventModalTriggerHelper() {
  const { setNewEventModalOpen } = useWorkspace();
  return (
    <>
      <button onClick={() => setNewEventModalOpen(true)}>Open Modal</button>
      <NewEventModal />
    </>
  );
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { PlanningAssistantDrawer } from '../features/copilot/PlanningAssistantDrawer';
import { clearAssistantStorage } from '../features/copilot/assistantStorage';
import * as planningService from '../services/planningAssistantService';

const AssistantTestWrapper: React.FC = () => {
  const { isAssistantOpen, setAssistantOpen } = useWorkspace();

  return (
    <div>
      <button data-testid="open-btn" onClick={() => setAssistantOpen(true)}>
        Open Assistant
      </button>
      <button data-testid="close-outside-btn" onClick={() => setAssistantOpen(false)}>
        Close Outside
      </button>
      {isAssistantOpen && <PlanningAssistantDrawer />}
    </div>
  );
};

describe('AI Assistant Chat History Persistence across Close and Reopen', () => {
  beforeEach(() => {
    clearAssistantStorage();
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('preserves conversation history when drawer is closed via X button and reopened', async () => {
    vi.spyOn(planningService, 'askPlanningAssistant').mockResolvedValueOnce({
      id: 'ai-res-123',
      role: 'assistant',
      timestamp: '12:00 PM',
      source: 'offline',
      model: 'offline-engine',
      content: 'Here is your custom persistent buffer plan.',
    });

    render(
      <WorkspaceProvider>
        <AssistantTestWrapper />
      </WorkspaceProvider>
    );

    // 1. Open assistant
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByRole('dialog', { name: /AuraPlan AI Planning Assistant/i })).toBeInTheDocument();
    expect(screen.getByText(/Hello! I am your AI assistant/i)).toBeInTheDocument();

    // 2. Send a custom chat message
    const input = screen.getByPlaceholderText(/Ask anything/i);
    fireEvent.change(input, { target: { value: 'Persistent question about timeline buffers' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    // 3. Verify message and AI response appear
    await waitFor(() => {
      expect(screen.getByText('Persistent question about timeline buffers')).toBeInTheDocument();
      expect(screen.getByText('Here is your custom persistent buffer plan.')).toBeInTheDocument();
    });

    // 4. Close the assistant via header Close button
    const closeBtn = screen.getByRole('button', { name: /Close assistant/i });
    fireEvent.click(closeBtn);

    // 5. Drawer is unmounted
    expect(screen.queryByRole('dialog', { name: /AuraPlan AI Planning Assistant/i })).not.toBeInTheDocument();

    // 6. Re-open the assistant
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByRole('dialog', { name: /AuraPlan AI Planning Assistant/i })).toBeInTheDocument();

    // 7. Verify the conversation history is STILL present
    expect(screen.getByText('Persistent question about timeline buffers')).toBeInTheDocument();
    expect(screen.getByText('Here is your custom persistent buffer plan.')).toBeInTheDocument();
  });

  it('allows user to clear chat history using the clear button', async () => {
    vi.spyOn(planningService, 'askPlanningAssistant').mockResolvedValueOnce({
      id: 'ai-res-456',
      role: 'assistant',
      timestamp: '12:05 PM',
      source: 'offline',
      model: 'offline-engine',
      content: 'Response to be cleared.',
    });

    render(
      <WorkspaceProvider>
        <AssistantTestWrapper />
      </WorkspaceProvider>
    );

    // Open & send message
    fireEvent.click(screen.getByTestId('open-btn'));
    const input = screen.getByPlaceholderText(/Ask anything/i);
    fireEvent.change(input, { target: { value: 'Query to delete' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText('Query to delete')).toBeInTheDocument();
    });

    // Click clear conversation history button
    const clearBtn = screen.getByRole('button', { name: /Clear conversation history/i });
    fireEvent.click(clearBtn);

    // History is cleared
    expect(screen.queryByText('Query to delete')).not.toBeInTheDocument();
    expect(screen.getByText(/Hello! I am your AI assistant/i)).toBeInTheDocument();

    // Close and reopen - remains cleared
    fireEvent.click(screen.getByRole('button', { name: /Close assistant/i }));
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.queryByText('Query to delete')).not.toBeInTheDocument();
  });
});


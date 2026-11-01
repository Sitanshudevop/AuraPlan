import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AssistantHeader } from '../features/copilot/AssistantHeader';
import { AssistantChipBar } from '../features/copilot/AssistantChipBar';
import { AssistantMessageList } from '../features/copilot/AssistantMessageList';
import { AssistantMessage } from '../types/assistant';

describe('Assistant Truthful Provenance & Badge Reliability (F7/LiveAI)', () => {
  it('renders "Gemini live" badge when connection is confirmed live', () => {
    render(
      <AssistantHeader
        eventName="Royal Wedding"
        eventType="wedding"
        guestCount={250}
        isLive={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Gemini live')).toBeInTheDocument();
    expect(screen.queryByText('Offline mode')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('renders "Offline mode" and a Retry button when isLive is false', () => {
    const handleRetry = vi.fn();
    render(
      <AssistantHeader
        eventName="Royal Wedding"
        eventType="wedding"
        guestCount={250}
        isLive={false}
        onRetry={handleRetry}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Offline mode')).toBeInTheDocument();
    expect(screen.queryByText('Gemini live')).not.toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('verifies NO API key prompts or password inputs exist anywhere in AssistantChipBar', () => {
    const { container } = render(
      <AssistantChipBar
        quickChips={['Buffer time?', 'Catering plates?']}
        onSelectChip={vi.fn()}
      />
    );

    // No password input, no paste key prompt, no session memory notes
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(screen.queryByPlaceholderText(/paste.*key/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/key is stored/i)).not.toBeInTheDocument();
    expect(screen.getByText('Buffer time?')).toBeInTheDocument();
  });

  it('renders transparent per-message provenance labels for Gemini vs Offline engine', () => {
    const messages: AssistantMessage[] = [
      {
        id: 'msg-1',
        role: 'assistant',
        timestamp: '10:00 AM',
        source: 'gemini',
        model: 'gemini-flash-lite-latest',
        content: 'This is live advice from Gemini model.',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        timestamp: '10:01 AM',
        source: 'offline',
        model: 'offline-engine',
        content: 'This is offline advice from deterministic local engine.',
      },
    ];

    render(
      <AssistantMessageList
        messages={messages}
        executedLabels={new Set()}
        onExecuteAction={vi.fn()}
        loading={false}
      />
    );

    expect(screen.getByText(/Gemini.*gemini-flash-lite-latest/)).toBeInTheDocument();
    expect(screen.getByText('Offline engine')).toBeInTheDocument();
    expect(screen.getByText('This is live advice from Gemini model.')).toBeInTheDocument();
    expect(screen.getByText('This is offline advice from deterministic local engine.')).toBeInTheDocument();
  });
});


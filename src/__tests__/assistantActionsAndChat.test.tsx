import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createRef } from 'react';
import { executeAssistantAction, ActionHandlerDeps } from '../features/copilot/assistantActionHandler';
import { AssistantChatInput } from '../features/copilot/AssistantChatInput';
import { AssistantChipBar } from '../features/copilot/AssistantChipBar';
import { weddingPreset } from '../data/weddingPreset';
import { AssistantAction } from '../services/planningAssistantService';

describe('Assistant Actions Handler and Chat UI Components', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  const mockDeps: ActionHandlerDeps = {
    event: weddingPreset.event,
    addMacroTask: vi.fn(),
    addBudgetItem: vi.fn(),
    addVendor: vi.fn(),
    announce: vi.fn(),
  };

  it('executes add_task action and announces completion', () => {
    const action: AssistantAction = {
      type: 'add_task',
      label: 'Add Task',
      payload: {
        task: {
          title: 'Schedule Menu Tasting',
          horizon: '3_months',
          category: 'Catering',
          priority: 'high',
        },
      },
    };

    executeAssistantAction(action, mockDeps);
    expect(mockDeps.addMacroTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Schedule Menu Tasting',
        horizon: '3_months',
        category: 'Catering',
        priority: 'high',
      })
    );
    expect(mockDeps.announce).toHaveBeenCalledWith(expect.stringContaining('Schedule Menu Tasting'));
  });

  it('executes add_budget and add_vendor actions', () => {
    const budgetAction: AssistantAction = {
      type: 'add_budget',
      label: 'Add Budget',
      payload: {
        budget: {
          name: 'Architectural Uplighting',
          category: 'decor',
          allocated: 35000,
        },
      },
    };

    executeAssistantAction(budgetAction, mockDeps);
    expect(mockDeps.addBudgetItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Architectural Uplighting',
        allocated: 35000,
      })
    );

    const vendorAction: AssistantAction = {
      type: 'add_vendor',
      label: 'Add Vendor',
      payload: {
        vendor: {
          name: 'Bloom & Petal Decorators',
          category: 'decor',
          estimatedPrice: 75000,
          deliverables: ['Mandap florals', 'Table centerpieces'],
        },
      },
    };

    executeAssistantAction(vendorAction, mockDeps);
    expect(mockDeps.addVendor).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bloom & Petal Decorators',
        estimatedPrice: 75000,
      })
    );
  });

  it('safely handles unknown or empty action payloads without throwing', () => {
    const invalidAction = {
      type: 'unknown_type' as unknown as 'add_task',
      label: 'Invalid',
      description: 'Invalid',
      payload: {},
    };

    expect(() => executeAssistantAction(invalidAction, mockDeps)).not.toThrow();
  });

  it('AssistantChatInput renders input, disables button on empty text, and triggers onSend', () => {
    const handleSend = vi.fn();
    const handleSetInput = vi.fn();
    const ref = createRef<HTMLInputElement>();

    const { rerender } = render(
      <AssistantChatInput
        input=""
        setInput={handleSetInput}
        loading={false}
        onSend={handleSend}
        inputRef={ref}
      />
    );

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    expect(sendBtn).toBeDisabled();

    rerender(
      <AssistantChatInput
        input="How to rebalance budget?"
        setInput={handleSetInput}
        loading={false}
        onSend={handleSend}
        inputRef={ref}
      />
    );
    expect(sendBtn).not.toBeDisabled();
    fireEvent.click(sendBtn);
    expect(handleSend).toHaveBeenCalled();
  });

  it('AssistantChipBar renders prompt chips and handles selection', () => {
    const handleSelectChip = vi.fn();
    render(
      <AssistantChipBar
        showKeyInput={false}
        customKey=""
        setCustomKey={vi.fn()}
        handleSaveKey={vi.fn()}
        handleClearKey={vi.fn()}
        hasKey={false}
        quickChips={['Rain contingency plan', 'Vendor payment schedule']}
        onSelectChip={handleSelectChip}
      />
    );

    const chip = screen.getByRole('button', { name: /Rain contingency plan/i });
    fireEvent.click(chip);
    expect(handleSelectChip).toHaveBeenCalledWith('Rain contingency plan');
  });
});

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useFocusTrap } from '../../hooks';
import { askPlanningAssistant, MODALITY_PROMPT_CHIPS, AssistantMessage, AssistantAction } from '../../services/planningAssistantService';
import { isGeminiKeyConfigured, setCustomApiKey, removeCustomApiKey } from '../../services/geminiService';
import { executeAssistantAction } from './assistantActionHandler';
import { AssistantChipBar } from './AssistantChipBar';
import { AssistantHeader } from './AssistantHeader';
import { AssistantMessageList } from './AssistantMessageList';
import { AssistantChatInput } from './AssistantChatInput';

export const PlanningAssistantDrawer: React.FC = () => {
  const { state, isAssistantOpen, setAssistantOpen, addMacroTask, addBudgetItem, addVendor, announce } = useWorkspace();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [executedLabels, setExecutedLabels] = useState<Set<string>>(new Set());
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [hasKey, setHasKey] = useState(() => isGeminiKeyConfigured());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSaveKey = () => {
    if (customKey.trim()) {
      setCustomApiKey(customKey.trim());
      setHasKey(true);
      setShowKeyInput(false);
      setCustomKey('');
      announce('Gemini API key saved');
    }
  };

  const handleClearKey = () => {
    removeCustomApiKey();
    setHasKey(isGeminiKeyConfigured());
    setShowKeyInput(false);
    announce('Custom Gemini API key cleared');
  };

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'ai-welcome',
      role: 'assistant',
      timestamp: 'Just now',
      content: `Hello! I am your AI assistant for **${state.event.name}** (${state.event.type} mode).\n\nAsk about vendor negotiations, buffer times, permits, or select a suggested prompt below.`,
    },
  ]);

  const handleClose = useCallback(() => setAssistantOpen(false), [setAssistantOpen]);
  const drawerRef = useFocusTrap<HTMLDivElement>(isAssistantOpen, handleClose);

  useEffect(() => {
    if (isAssistantOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isAssistantOpen]);

  if (!isAssistantOpen) return null;

  const quickChips = MODALITY_PROMPT_CHIPS[state.event.type] || MODALITY_PROMPT_CHIPS.wedding;

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim() || loading) return;
    const userMsg: AssistantMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await askPlanningAssistant(query, state.event, state);
      setMessages((prev) => [...prev, res]);
      announce(`AI Assistant responded to ${query.slice(0, 30)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = (action: AssistantAction) => {
    executeAssistantAction(action, { event: state.event, addMacroTask, addBudgetItem, addVendor, announce });
    setExecutedLabels((prev) => new Set(prev).add(action.label));
  };

  const content = (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-black/80 backdrop-blur-md flex justify-end"
      onClick={handleClose}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#FAF9F6] dark:bg-[#111113] text-[#111113] dark:text-[#EDEDEF] border-l border-stone-200/80 dark:border-white/[0.08] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-150"
      >
        <AssistantHeader
          eventName={state.event.name}
          eventType={state.event.type}
          guestCount={state.event.guestCount}
          hasKey={hasKey}
          onToggleKeyInput={() => setShowKeyInput((v) => !v)}
          onClose={handleClose}
        />

        <AssistantChipBar
          showKeyInput={showKeyInput}
          customKey={customKey}
          setCustomKey={setCustomKey}
          handleSaveKey={handleSaveKey}
          handleClearKey={handleClearKey}
          hasKey={hasKey}
          quickChips={quickChips}
          onSelectChip={handleSend}
        />

        <AssistantMessageList
          messages={messages}
          executedLabels={executedLabels}
          onExecuteAction={handleExecuteAction}
          loading={loading}
        />

        <AssistantChatInput
          input={input}
          setInput={setInput}
          loading={loading}
          onSend={handleSend}
          inputRef={inputRef}
        />
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

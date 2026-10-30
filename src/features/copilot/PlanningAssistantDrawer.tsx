import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useFocusTrap } from '../../hooks';
import {
  askPlanningAssistant, MODALITY_PROMPT_CHIPS, AssistantMessage, AssistantAction,
} from '../../services/planningAssistantService';
import { isGeminiKeyConfigured, setCustomApiKey, removeCustomApiKey } from '../../services/geminiService';
import { Button } from '../../components/ui/Button';
import { StatusDot } from '../../components/ui/StatusDot';
import { X, Send, Loader2, Check, CalendarPlus, Wallet, Key } from 'lucide-react';
import { executeAssistantAction } from './assistantActionHandler';
import { FormattedAssistantMessage } from './FormattedAssistantMessage';

export const PlanningAssistantDrawer: React.FC = () => {
  const {
    state, isAssistantOpen, setAssistantOpen, addMacroTask, addBudgetItem, addVendor, announce,
  } = useWorkspace();

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

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
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
        <div className="h-14 px-5 border-b border-stone-200/80 dark:border-white/[0.08] bg-[#FAF9F6] dark:bg-[#111113] flex items-center justify-between shrink-0">
          <div>
            <h3 id="assistant-drawer-title" className="font-semibold text-sm text-[#111113] dark:text-[#EDEDEF]">
              AuraPlan AI Planning Assistant
            </h3>
            <p className="text-xs text-stone-500 dark:text-[#8B8B93] capitalize">
              {state.event.type} mode · {state.event.guestCount} guests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput((v) => !v)}
              className="text-xs font-mono px-2 py-1 rounded-md border border-stone-200/80 dark:border-white/[0.08] bg-stone-100 dark:bg-white/[0.04] text-stone-600 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF] transition-colors flex items-center gap-1.5"
              aria-label="Toggle Gemini API Key settings"
            >
              <StatusDot status={hasKey ? 'confirmed' : 'pending'} />
              <span>{hasKey ? 'Gemini live' : 'Deterministic'}</span>
            </button>
            <button onClick={handleClose} className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-[#EDEDEF] rounded-md transition-colors" aria-label="Close assistant">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showKeyInput && (
          <div className="p-3 bg-stone-100/80 dark:bg-[#161618] border-b border-stone-200/80 dark:border-white/[0.08] flex items-center gap-2 text-xs">
            <Key className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <input
              type="password"
              placeholder="Paste Gemini API key..."
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-white/[0.08] rounded-md text-[#111113] dark:text-[#EDEDEF] focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <Button size="sm" variant="primary" onClick={handleSaveKey} disabled={!customKey.trim()}>Save</Button>
            {hasKey && <Button size="sm" variant="ghost" onClick={handleClearKey}>Reset</Button>}
          </div>
        )}

        <div className="p-4 border-b border-stone-200/80 dark:border-white/[0.08] bg-stone-50/50 dark:bg-white/[0.01] space-y-2 shrink-0">
          <span className="text-xs font-medium text-stone-500 dark:text-[#8B8B93] block">Suggested prompts</span>
          <div className="flex flex-wrap gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-xs px-2.5 py-1 bg-white dark:bg-white/[0.04] hover:bg-stone-100 dark:hover:bg-white/[0.08] border border-stone-200/80 dark:border-white/[0.08] rounded-md text-stone-800 dark:text-[#EDEDEF] transition-colors text-left shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3 flex-1 overflow-y-auto text-xs scrollbar-thin">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] p-3.5 rounded-xl space-y-2.5 ${
                  m.role === 'user'
                    ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#111113] font-medium shadow-xs'
                    : 'bg-white dark:bg-[#161618] text-[#111113] dark:text-[#EDEDEF] border border-stone-200/80 dark:border-white/[0.08] shadow-xs'
                }`}
              >
                <FormattedAssistantMessage content={m.content} isUser={m.role === 'user'} />
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-stone-100 dark:border-white/[0.06] space-y-1.5">
                    <span className="text-[11px] font-medium text-stone-500 dark:text-[#8B8B93] block">Plan actions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestedActions.map((act, i) => {
                        const isDone = executedLabels.has(act.label);
                        return (
                          <Button
                            key={i}
                            variant="secondary"
                            size="xs"
                            onClick={() => handleExecuteAction(act)}
                            disabled={isDone}
                            icon={isDone ? <Check className="w-3 h-3 text-emerald-500" /> : act.type === 'add_task' ? <CalendarPlus className="w-3 h-3 text-stone-400" /> : <Wallet className="w-3 h-3 text-stone-400" />}
                          >
                            {isDone ? 'Applied to Plan ✓' : act.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-stone-400 dark:text-zinc-500 mt-1 tabular-nums px-1">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-[#161618] border border-stone-200/80 dark:border-white/[0.08] rounded-lg text-xs text-stone-500 dark:text-[#8B8B93] w-fit shadow-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6E79F5]" />
              <span>Generating response...</span>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-stone-200/80 dark:border-white/[0.08] bg-[#FAF9F6] dark:bg-[#111113] shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. weather contingency, buffer times)..."
              className="flex-1 text-xs px-3 py-2 bg-white dark:bg-[#161618] border border-stone-200/80 dark:border-white/[0.08] rounded-md focus:outline-none focus:ring-1 focus:ring-[#6E79F5] text-[#111113] dark:text-[#EDEDEF] placeholder:text-stone-400 dark:placeholder:text-zinc-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!input.trim() || loading}
              icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

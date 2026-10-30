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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-drawer-title"
        className="w-full max-w-lg bg-surface border-l border-hairline h-full flex flex-col shadow-xl animate-in slide-in-from-right duration-150"
      >
        <div className="h-14 px-5 border-b border-hairline flex items-center justify-between shrink-0">
          <div>
            <h3 id="assistant-drawer-title" className="font-semibold text-sm text-[#18181B] dark:text-[#EDEDEF]">
              AuraPlan AI Planning Assistant
            </h3>
            <p className="text-xs text-muted">{state.event.type} mode · {state.event.guestCount} guests</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput((v) => !v)}
              className="text-xs font-mono px-2 py-1 rounded-md border border-hairline bg-surface-raised text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
              aria-label="Toggle Gemini API Key settings"
            >
              <StatusDot status={hasKey ? 'confirmed' : 'pending'} />
              <span>{hasKey ? 'Gemini live' : 'Deterministic'}</span>
            </button>
            <button onClick={handleClose} className="p-1.5 text-muted hover:text-foreground rounded-md transition-colors" aria-label="Close assistant">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showKeyInput && (
          <div className="p-3 bg-surface-raised border-b border-hairline flex items-center gap-2 text-xs">
            <Key className="w-3.5 h-3.5 text-muted shrink-0" />
            <input
              type="password"
              placeholder="Paste Gemini API key..."
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 bg-surface border border-hairline rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <Button size="sm" variant="primary" onClick={handleSaveKey} disabled={!customKey.trim()}>Save</Button>
            {hasKey && <Button size="sm" variant="ghost" onClick={handleClearKey}>Reset</Button>}
          </div>
        )}

        <div className="p-4 border-b border-hairline space-y-2 shrink-0">
          <span className="text-xs text-muted block">Suggested prompts</span>
          <div className="flex flex-wrap gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-xs px-2.5 py-1 bg-surface-raised hover:bg-stone-200 dark:hover:bg-white/[0.08] border border-hairline rounded-md text-foreground transition-colors text-left"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3 flex-1 overflow-y-auto text-xs">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg space-y-2 ${m.role === 'user' ? 'bg-foreground text-background font-medium' : 'bg-surface-raised text-foreground border border-hairline'}`}>
                <FormattedAssistantMessage content={m.content} isUser={m.role === 'user'} />
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-hairline space-y-1.5">
                    <span className="text-xs text-muted block">Plan actions:</span>
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
                            icon={isDone ? <Check className="w-3 h-3 text-emerald-500" /> : act.type === 'add_task' ? <CalendarPlus className="w-3 h-3 text-muted" /> : <Wallet className="w-3 h-3 text-muted" />}
                          >
                            {isDone ? 'Applied to Plan ✓' : act.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[11px] text-muted mt-1 tabular-nums px-1">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-2.5 bg-surface-raised border border-hairline rounded-md text-xs text-muted w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
              <span>Generating response...</span>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-hairline bg-surface shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. weather contingency, buffer times)..."
              className="flex-1 text-xs px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
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

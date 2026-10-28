import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useFocusTrap } from '../../hooks';
import {
  askPlanningAssistant, MODALITY_PROMPT_CHIPS, AssistantMessage, AssistantAction,
} from '../../services/planningAssistantService';
import { Button } from '../../components/ui/Button';
import { Bot, X, Send, Sparkles, Loader2, Check, CalendarPlus, Wallet } from 'lucide-react';
import { executeAssistantAction } from './assistantActionHandler';
import { FormattedAssistantMessage } from './FormattedAssistantMessage';

export const PlanningAssistantDrawer: React.FC = () => {
  const {
    state, isAssistantOpen, setAssistantOpen, addMacroTask, addBudgetItem, addVendor, announce,
  } = useWorkspace();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [executedLabels, setExecutedLabels] = useState<Set<string>>(new Set());

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'ai-welcome',
      role: 'assistant',
      timestamp: 'Just now',
      content: `Hello! I am your AuraPlan AI Assistant for **${state.event.name}** (${state.event.type.toUpperCase()} Mode).\n\nAsk me about vendor contracts, buffer times, permits, or select a suggested prompt below!`,
    },
  ]);

  const drawerRef = useFocusTrap<HTMLDivElement>(isAssistantOpen, () => setAssistantOpen(false));
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
    executeAssistantAction(action, {
      event: state.event,
      addMacroTask,
      addBudgetItem,
      addVendor,
      announce,
    });
    setExecutedLabels((prev) => new Set(prev).add(action.label));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-drawer-title"
        className="w-full max-w-xl bg-white dark:bg-[#121215] border-l border-stone-200/90 dark:border-zinc-800 h-full flex flex-col shadow-md animate-in slide-in-from-right duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-md">
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 id="assistant-drawer-title" className="font-bold text-sm text-[#18181B] dark:text-[#FAFAFA]">
                AuraPlan AI Planning Assistant
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                Context-aware for {state.event.type.toUpperCase()} Mode • {state.event.guestCount} guests
              </p>
            </div>
          </div>
          <button
            onClick={() => setAssistantOpen(false)}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-md"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Chips */}
        <div className="p-3 bg-stone-50 dark:bg-zinc-900/60 border-b border-stone-200 dark:border-zinc-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Suggested {state.event.type} Prompts
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-[11px] px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-750 border border-stone-200 dark:border-zinc-700 rounded-md text-stone-700 dark:text-zinc-300 transition-colors text-left"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Feed */}
        <div className="p-4 space-y-3.5 flex-1 overflow-y-auto text-xs">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] p-3 rounded-xl space-y-2 ${
                  m.role === 'user'
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 rounded-br-xs'
                    : 'bg-stone-100/80 dark:bg-zinc-900/80 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-800 rounded-bl-xs'
                }`}
              >
                <FormattedAssistantMessage content={m.content} isUser={m.role === 'user'} />

                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-zinc-400 block">
                      1-Click Plan Actions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestedActions.map((act, i) => {
                        const isDone = executedLabels.has(act.label);
                        return (
                          <Button
                            key={i}
                            variant={isDone ? 'secondary' : 'outline'}
                            size="xs"
                            onClick={() => handleExecuteAction(act)}
                            disabled={isDone}
                            icon={isDone ? <Check className="w-3 h-3 text-emerald-600" /> : act.type === 'add_task' ? <CalendarPlus className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                          >
                            {isDone ? 'Applied to Plan ✓' : act.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-stone-400 mt-1 font-mono px-1">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-stone-100 dark:bg-zinc-900 rounded-lg text-xs text-stone-500 w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Synthesizing plan response...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-3 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-[#121215]">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. Weather contingency, buffer times, catering)..."
              className="flex-1 text-xs px-3 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none dark:text-white"
            />
            <Button type="submit" variant="primary" size="sm" disabled={!input.trim() || loading} icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};


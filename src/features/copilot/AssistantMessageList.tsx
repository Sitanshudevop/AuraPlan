import React from 'react';
import { AssistantMessage, AssistantAction } from '../../services/planningAssistantService';
import { Button } from '../../components/ui/Button';
import { FormattedAssistantMessage } from './FormattedAssistantMessage';
import { Check, CalendarPlus, Wallet, Loader2 } from 'lucide-react';

interface AssistantMessageListProps {
  messages: AssistantMessage[];
  executedLabels: Set<string>;
  onExecuteAction: (action: AssistantAction) => void;
  loading: boolean;
}

export const AssistantMessageList: React.FC<AssistantMessageListProps> = ({
  messages,
  executedLabels,
  onExecuteAction,
  loading,
}) => {
  return (
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
            {m.role === 'assistant' && (
              <div className="flex items-center gap-1.5 pb-1 border-b border-stone-100 dark:border-white/[0.04]">
                {m.source === 'gemini' ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Gemini{m.model ? ` (${m.model})` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border border-stone-200/60 dark:border-zinc-700/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                    Offline engine
                  </span>
                )}
              </div>
            )}
            <FormattedAssistantMessage content={m.content} isUser={m.role === 'user'} />
            {m.suggestedActions && m.suggestedActions.length > 0 && (
              <div className="pt-2 border-t border-stone-100 dark:border-white/[0.06] space-y-1.5">
                <span className="text-xs font-medium text-stone-500 dark:text-[#8B8B93] block">Plan actions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {m.suggestedActions.map((act, i) => {
                    const isDone = executedLabels.has(act.label);
                    return (
                      <Button
                        key={i}
                        variant="secondary"
                        size="xs"
                        onClick={() => onExecuteAction(act)}
                        disabled={isDone}
                        icon={
                          isDone ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : act.type === 'add_task' ? (
                            <CalendarPlus className="w-3 h-3 text-stone-500" />
                          ) : (
                            <Wallet className="w-3 h-3 text-stone-500" />
                          )
                        }
                      >
                        {isDone ? 'Applied to Plan ✓' : act.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <span className="text-[10px] text-stone-500 dark:text-zinc-500 mt-1 tabular-nums px-1">{m.timestamp}</span>
        </div>
      ))}

      {loading && (
        <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-[#161618] border border-stone-200/80 dark:border-white/[0.08] rounded-lg text-xs text-stone-500 dark:text-[#8B8B93] w-fit shadow-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6E79F5]" />
          <span>Generating response...</span>
        </div>
      )}
    </div>
  );
};


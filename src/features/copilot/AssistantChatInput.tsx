import React from 'react';
import { Button } from '../../components/ui/Button';
import { Send, Loader2 } from 'lucide-react';

interface AssistantChatInputProps {
  input: string;
  setInput: (val: string) => void;
  loading: boolean;
  onSend: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const AssistantChatInput: React.FC<AssistantChatInputProps> = ({
  input,
  setInput,
  loading,
  onSend,
  inputRef,
}) => {
  return (
    <div className="p-3 border-t border-stone-200/80 dark:border-white/[0.08] bg-[#FAF9F6] dark:bg-[#111113] shrink-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything (e.g. weather contingency, buffer times)..."
          className="flex-1 text-xs px-3 py-2 bg-white dark:bg-[#161618] border border-stone-200/80 dark:border-white/[0.08] rounded-md focus:outline-none focus:ring-1 focus:ring-[#6E79F5] text-[#111113] dark:text-[#EDEDEF] placeholder:text-stone-500 dark:placeholder:text-zinc-500"
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
  );
};


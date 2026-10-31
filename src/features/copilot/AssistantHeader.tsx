import React from 'react';
import { X } from 'lucide-react';
import { StatusDot } from '../../components/ui/StatusDot';

interface AssistantHeaderProps {
  eventName: string;
  eventType: string;
  guestCount: number;
  hasKey: boolean;
  onToggleKeyInput: () => void;
  onClose: () => void;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  eventName,
  eventType,
  guestCount,
  hasKey,
  onToggleKeyInput,
  onClose,
}) => {
  return (
    <div className="h-14 px-5 border-b border-stone-200/80 dark:border-white/[0.08] bg-[#FAF9F6] dark:bg-[#111113] flex items-center justify-between shrink-0">
      <div>
        <h3 id="assistant-drawer-title" className="font-semibold text-sm text-[#111113] dark:text-[#EDEDEF]">
          AuraPlan AI Planning Assistant
        </h3>
        <p className="text-xs text-stone-500 dark:text-[#8B8B93] truncate max-w-xs">
          {eventName} · <span className="capitalize">{eventType} mode</span> · {guestCount} guests
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleKeyInput}
          title={hasKey ? 'Connected to Google Gemini Live API' : 'Local Deterministic Mode Active (Zero Latency)'}
          className="text-xs font-mono px-2 py-1 rounded-md border border-stone-200/80 dark:border-white/[0.08] bg-stone-100 dark:bg-white/[0.04] text-stone-600 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF] transition-colors flex items-center gap-1.5"
          aria-label="Toggle Gemini API Key settings"
        >
          <StatusDot status={hasKey ? 'confirmed' : 'pending'} />
          <span>{hasKey ? 'Gemini live' : 'Local (Zero Latency)'}</span>
        </button>
        <button
          onClick={onClose}
          className="p-1.5 text-stone-500 hover:text-stone-700 dark:hover:text-[#EDEDEF] rounded-md transition-colors"
          aria-label="Close assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

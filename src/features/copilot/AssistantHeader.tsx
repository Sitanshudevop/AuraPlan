import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { StatusDot } from '../../components/ui/StatusDot';

interface AssistantHeaderProps {
  eventName: string;
  eventType: string;
  guestCount: number;
  isLive: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
  onClose: () => void;
  onClearChat?: () => void;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  eventName,
  eventType,
  guestCount,
  isLive,
  isRetrying,
  onRetry,
  onClose,
  onClearChat,
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
        <div
          title={isLive ? 'Connected to Google Gemini Live API' : 'Operating in offline local engine mode'}
          className="text-xs font-mono px-2 py-1 rounded-md border border-stone-200/80 dark:border-white/[0.08] bg-stone-100 dark:bg-white/[0.04] text-stone-600 dark:text-[#8B8B93] flex items-center gap-1.5"
        >
          <StatusDot status={isLive ? 'confirmed' : 'pending'} />
          <span role="status" aria-live="polite">{isLive ? 'Gemini live' : 'Offline mode'}</span>
        </div>
        {!isLive && onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="text-xs font-mono px-2 py-1 rounded-md border border-stone-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.08] hover:bg-stone-50 text-stone-700 dark:text-[#EDEDEF] transition-colors"
            aria-label="Retry connecting to Gemini API"
          >
            {isRetrying ? 'Checking...' : 'Retry'}
          </button>
        )}
        {onClearChat && (
          <button
            onClick={onClearChat}
            className="p-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-stone-500 hover:text-stone-700 dark:hover:text-[#EDEDEF] rounded-md transition-colors"
            title="Clear conversation history"
            aria-label="Clear conversation history"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-stone-500 hover:text-stone-700 dark:hover:text-[#EDEDEF] rounded-md transition-colors"
          aria-label="Close assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

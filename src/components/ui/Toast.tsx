import React, { useEffect, useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { announcerMessage } = useWorkspace();
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (announcerMessage) {
      setCurrentMessage(announcerMessage);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [announcerMessage]);

  if (!visible || !currentMessage) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2.5 bg-white dark:bg-[#121215] text-[#18181B] dark:text-[#FAFAFA] border border-stone-200/90 dark:border-zinc-800 rounded-lg shadow-md animate-fade-in text-xs font-medium"
      role="status"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      <span className="truncate max-w-sm">{currentMessage}</span>
      <button
        onClick={() => setVisible(false)}
        className="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 ml-1"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

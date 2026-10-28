import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getDaysRemaining } from '../../utils/formatters';
import { Sparkles, CalendarClock, ArrowRight, X } from 'lucide-react';

interface WelcomeHeroProps {
  taskCompletionPct: number;
  signedVendors: number;
  totalVendors: number;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  taskCompletionPct,
  signedVendors,
  totalVendors,
}) => {
  const { state, setActiveTab } = useWorkspace();
  const [isDismissed, setIsDismissed] = useState(false);
  const daysLeft = getDaysRemaining(state.event.date);

  if (isDismissed) return null;

  const getGreeting = () => {
    if (state.event.type === 'wedding') {
      return `Namaste 👋 Your ${state.event.name} is ${daysLeft} days away`;
    }
    if (state.event.type === 'birthday') {
      return `Celebration Time 🎉 ${state.event.name} is ${daysLeft} days away`;
    }
    return `Welcome Leaders 🚀 ${state.event.name} is ${daysLeft} days away`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200 dark:border-zinc-800/80 bg-gradient-to-br from-amber-500/8 via-white to-stone-50 dark:from-amber-500/10 dark:via-[#161619] dark:to-[#121215] p-5 sm:p-6 shadow-xs transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Luxury Concierge Assistant</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight text-stone-900 dark:text-white">
            {getGreeting()}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">
            Planning is on schedule: <strong className="text-stone-800 dark:text-zinc-200 font-mono">{taskCompletionPct}%</strong> tasks completed,{' '}
            <strong className="text-stone-800 dark:text-zinc-200 font-mono">{signedVendors}/{totalVendors}</strong> vendors contracted, and preparations in {state.event.city} are progressing smoothly.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#18181B] text-white hover:bg-stone-800 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300 shadow-xs transition-colors"
            >
              <span>Review today's tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-stone-200 dark:border-zinc-700 transition-colors"
            >
              <CalendarClock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Open run-of-show</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg hover:bg-stone-200/50 dark:hover:bg-zinc-800 transition-colors shrink-0"
          title="Dismiss greeting banner"
          aria-label="Dismiss greeting"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

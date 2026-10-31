import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getDaysRemaining } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Calendar } from 'lucide-react';

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
  const daysLeft = getDaysRemaining(state.event.date);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-white/[0.08]">
      <div className="space-y-1">
        <div className="text-xs font-normal text-stone-500 dark:text-[#8B8B93]">
          {getGreetingTime()} · Namaste
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#111113] dark:text-[#EDEDEF]">
          {state.event.name}
        </h2>
        <p className="text-sm text-stone-500 dark:text-[#8B8B93] tabular-nums">
          {daysLeft} days to go · {taskCompletionPct}% of tasks complete · {signedVendors} of {totalVendors} vendors contracted
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setActiveTab('timeline')}
          icon={<ArrowRight />}
        >
          Review tasks
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab('timeline')}
          icon={<Calendar />}
        >
          Run-of-show
        </Button>
      </div>
    </div>
  );
};

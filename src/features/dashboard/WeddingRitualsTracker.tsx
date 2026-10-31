import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';

interface Ritual {
  id: string;
  name: string;
  done: boolean;
}

const INITIAL_RITUALS: Ritual[] = [
  { id: 'rit-1', name: 'Ganesh Sthapana & Mandap Muhurat', done: true },
  { id: 'rit-2', name: 'Mehendi Lagai & Folk Sangeet Antakshari', done: true },
  { id: 'rit-3', name: 'Haldi Ubtan & Floral Bath', done: false },
  { id: 'rit-4', name: 'Safa Tying & Baraat Departure Protocol', done: false },
  { id: 'rit-5', name: 'Varmala & Sunset Pheras by Lakefront', done: false },
  { id: 'rit-6', name: 'Kanyadaan, Sindoor Daan & Vidaai', done: false },
];

export const WeddingRitualsTracker: React.FC = () => {
  const [rituals, setRituals] = useState<Ritual[]>(INITIAL_RITUALS);
  const [showAllRituals, setShowAllRituals] = useState(false);

  const toggleRitual = (id: string) => {
    setRituals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    );
  };

  const displayedRituals = showAllRituals ? rituals : rituals.slice(0, 4);

  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-700 dark:text-[#EDEDEF]">
          Traditional Ceremonies & VIP Protocol
        </span>
        <span className="text-xs text-stone-500 dark:text-zinc-500 tabular-nums">
          {rituals.filter((r) => r.done).length} of {rituals.length} complete
        </span>
      </div>

      <div className="space-y-1.5">
        {displayedRituals.map((r) => (
          <button
            key={r.id}
            onClick={() => toggleRitual(r.id)}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs text-left transition-colors ${
              r.done
                ? 'border-stone-200/60 dark:border-white/[0.04] bg-stone-50/30 dark:bg-white/[0.01] text-stone-500 dark:text-zinc-400'
                : 'border-stone-200/80 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/[0.14] text-stone-800 dark:text-[#EDEDEF]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {r.done ? (
                <CheckCircle2 className="w-4 h-4 text-[#10B981] stroke-[1.5] shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-stone-300 dark:text-zinc-600 stroke-[1.5] shrink-0" />
              )}
              <span>{r.name}</span>
            </div>
            <span className="text-[11px] text-stone-500 dark:text-zinc-500">
              {r.done ? 'Verified' : 'Pending'}
            </span>
          </button>
        ))}
      </div>

      {rituals.length > 4 && (
        <div className="text-center pt-1">
          <button
            onClick={() => setShowAllRituals(!showAllRituals)}
            className="inline-flex items-center gap-1 text-xs text-[#6E79F5] hover:text-[#5D68E2] transition-colors"
          >
            <span>{showAllRituals ? 'Show fewer' : 'Show all rituals'}</span>
            {showAllRituals ? <ChevronUp className="w-3.5 h-3.5 stroke-[1.5]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />}
          </button>
        </div>
      )}
    </div>
  );
};


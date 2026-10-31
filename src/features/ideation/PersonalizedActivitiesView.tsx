import React, { useState } from 'react';
import { EventType, Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { MODALITY_ACTIVITIES, PersonalizedActivity } from '../../data/modalityActivities';
import { Check, CalendarPlus, Wallet } from 'lucide-react';

export type { PersonalizedActivity };

interface Props {
  eventType: EventType;
  currency: Currency;
  onAddToTimeline: (activity: PersonalizedActivity) => void;
  onAddToBudget: (activity: PersonalizedActivity) => void;
}

export const PersonalizedActivitiesView: React.FC<Props> = ({
  eventType,
  currency,
  onAddToTimeline,
  onAddToBudget,
}) => {
  const activities = MODALITY_ACTIVITIES[eventType] || MODALITY_ACTIVITIES.wedding;
  const [addedTimelineIds, setAddedTimelineIds] = useState<Set<string>>(new Set());
  const [addedBudgetIds, setAddedBudgetIds] = useState<Set<string>>(new Set());

  const handleAddTimeline = (act: PersonalizedActivity) => {
    onAddToTimeline(act);
    setAddedTimelineIds((prev) => new Set(prev).add(act.id));
  };

  const handleAddBudget = (act: PersonalizedActivity) => {
    onAddToBudget(act);
    setAddedBudgetIds((prev) => new Set(prev).add(act.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-stone-200/80 dark:border-white/[0.08]">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[#111113] dark:text-[#EDEDEF]">
            Curated experiential moments & personalized itinerary
          </h3>
          <p className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5">
            Add experiential moments directly into your run-of-show and budget ledger
          </p>
        </div>
        <span className="text-xs text-stone-500 dark:text-zinc-500">
          {activities.length} ideas available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((act) => {
          const isTimelineAdded = addedTimelineIds.has(act.id);
          const isBudgetAdded = addedBudgetIds.has(act.id);

          return (
            <div
              key={act.id}
              className="p-5 bg-white dark:bg-[#111113] rounded-xl border border-stone-200/80 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/[0.14] transition-colors space-y-3 flex flex-col justify-between text-xs"
            >
              <div className="space-y-1.5">
                {/* Category as muted text line above title */}
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-500">
                  <span className="capitalize">{act.category}</span>
                  <span className="tabular-nums">{act.durationMinutes} mins · {act.location}</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-sm font-medium text-[#111113] dark:text-[#EDEDEF] leading-snug">
                    {act.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-[#8B8B93] leading-relaxed mt-1">
                    {act.description}
                  </p>
                </div>

                {act.culturalNote && (
                  <p className="text-[11px] text-stone-600 dark:text-[#8B8B93] bg-stone-50/80 dark:bg-white/[0.03] border border-stone-200/60 dark:border-white/[0.04] p-2 rounded-lg leading-relaxed">
                    Note: {act.culturalNote}
                  </p>
                )}
              </div>

              {/* Bottom Row: Lead on Left, Price + Actions on Right */}
              <div className="pt-3 border-t border-stone-100 dark:border-white/[0.04] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-stone-500 dark:text-zinc-500 truncate">
                  Lead: {act.poc}
                </span>

                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-xs font-semibold tabular-nums text-[#111113] dark:text-[#EDEDEF]">
                    {formatCurrency(act.estimatedCost, currency)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant={isTimelineAdded ? 'secondary' : 'outline'}
                      size="xs"
                      onClick={() => handleAddTimeline(act)}
                      disabled={isTimelineAdded}
                      icon={isTimelineAdded ? <Check className="w-3 h-3 text-emerald-500" /> : <CalendarPlus className="w-3 h-3 stroke-[1.5]" />}
                    >
                      {isTimelineAdded ? 'In run-of-show' : '+ Run-of-show'}
                    </Button>

                    <Button
                      variant={isBudgetAdded ? 'secondary' : 'outline'}
                      size="xs"
                      onClick={() => handleAddBudget(act)}
                      disabled={isBudgetAdded}
                      icon={isBudgetAdded ? <Check className="w-3 h-3 text-emerald-500" /> : <Wallet className="w-3 h-3 stroke-[1.5]" />}
                    >
                      {isBudgetAdded ? 'In budget' : '+ Budget'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { EventType, Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MODALITY_ACTIVITIES, PersonalizedActivity } from '../../data/modalityActivities';
import { Sparkles, CalendarPlus, Wallet, Check } from 'lucide-react';

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
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#18181B] dark:text-[#FAFAFA] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Curated Experiential Moments & Personalized Itinerary</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Modality-tailored creative highlights with 1-click injection into your Run-of-Show and Budget
          </p>
        </div>
        <Badge variant="indigo" size="sm">{activities.length} Ideas Available</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activities.map((act) => {
          const isTimelineAdded = addedTimelineIds.has(act.id);
          const isBudgetAdded = addedBudgetIds.has(act.id);

          return (
            <div
              key={act.id}
              className="p-3.5 bg-white dark:bg-zinc-900/60 rounded-xl border border-stone-200 dark:border-zinc-800 space-y-2.5 shadow-xs hover:border-stone-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                    {act.title}
                  </h4>
                  <span className="text-[10px] text-stone-400 font-mono tabular-nums">
                    {act.location} • {act.durationMinutes} mins
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-stone-800 dark:text-zinc-200 tabular-nums">
                    {formatCurrency(act.estimatedCost, currency)}
                  </span>
                  <Badge variant="stone" size="sm" className="block mt-0.5 uppercase">
                    {act.category}
                  </Badge>
                </div>
              </div>

              <p className="text-[11px] text-stone-600 dark:text-zinc-400 leading-relaxed">
                {act.description}
              </p>

              {act.culturalNote && (
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30 px-2 py-1 rounded">
                  ✦ {act.culturalNote}
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <span className="text-[10px] text-stone-400 truncate">
                  POC: {act.poc}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant={isTimelineAdded ? 'secondary' : 'outline'}
                    size="xs"
                    onClick={() => handleAddTimeline(act)}
                    disabled={isTimelineAdded}
                    icon={isTimelineAdded ? <Check className="w-3 h-3 text-emerald-600" /> : <CalendarPlus className="w-3 h-3" />}
                  >
                    {isTimelineAdded ? 'In Run-of-Show' : '+ Run-of-Show'}
                  </Button>

                  <Button
                    variant={isBudgetAdded ? 'secondary' : 'outline'}
                    size="xs"
                    onClick={() => handleAddBudget(act)}
                    disabled={isBudgetAdded}
                    icon={isBudgetAdded ? <Check className="w-3 h-3 text-emerald-600" /> : <Wallet className="w-3 h-3" />}
                  >
                    {isBudgetAdded ? 'In Budget' : '+ Budget'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

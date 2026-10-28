import React, { useState } from 'react';
import { EventType, Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MODALITY_ACTIVITIES, PersonalizedActivity } from '../../data/modalityActivities';
import { Sparkles, CalendarPlus, Wallet, Check, Clock, MapPin } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif font-bold text-[#18181B] dark:text-[#FAFAFA] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Curated Experiential Moments & Personalized Itinerary</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
            Modality-tailored creative highlights with 1-click injection into your Run-of-Show and Budget
          </p>
        </div>
        <Badge variant="indigo" size="sm">{activities.length} Ideas Available</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activities.map((act) => {
          const isTimelineAdded = addedTimelineIds.has(act.id);
          const isBudgetAdded = addedBudgetIds.has(act.id);

          return (
            <div
              key={act.id}
              className="p-5 bg-white dark:bg-zinc-900/60 rounded-2xl border border-stone-200 dark:border-zinc-800 space-y-3.5 shadow-xs hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Category Badge on its own line above title */}
                <div className="flex items-center justify-between">
                  <Badge variant="stone" size="sm" className="uppercase font-mono text-[10px]">
                    {act.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-[11px] text-stone-600 dark:text-zinc-400 font-mono tabular-nums">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {act.durationMinutes} mins
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {act.location}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-white leading-snug">
                    {act.title}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed mt-1.5">
                    {act.description}
                  </p>
                </div>

                {act.culturalNote && (
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 px-2.5 py-1.5 rounded-xl leading-relaxed">
                    ✦ {act.culturalNote}
                  </div>
                )}
              </div>

              {/* Bottom Row: POC on Left, Price + Action Buttons on Right */}
              <div className="pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-stone-600 dark:text-zinc-400 font-medium truncate">
                  Lead: {act.poc}
                </span>

                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-xs font-mono font-bold text-stone-900 dark:text-white tabular-nums">
                    {formatCurrency(act.estimatedCost, currency)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant={isTimelineAdded ? 'secondary' : 'outline'}
                      size="xs"
                      onClick={() => handleAddTimeline(act)}
                      disabled={isTimelineAdded}
                      icon={isTimelineAdded ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <CalendarPlus className="w-3 h-3" />}
                    >
                      {isTimelineAdded ? 'In Run-of-Show' : '+ Run-of-Show'}
                    </Button>

                    <Button
                      variant={isBudgetAdded ? 'secondary' : 'outline'}
                      size="xs"
                      onClick={() => handleAddBudget(act)}
                      disabled={isBudgetAdded}
                      icon={isBudgetAdded ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Wallet className="w-3 h-3" />}
                    >
                      {isBudgetAdded ? 'In Budget' : '+ Budget'}
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

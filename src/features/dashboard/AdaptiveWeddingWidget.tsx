import React, { useState, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Calendar, Users, MapPin, CheckCircle2, Circle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

export const AdaptiveWeddingWidget: React.FC = () => {
  const { state } = useWorkspace();
  const [selectedSubEventId, setSelectedSubEventId] = useState<string>(
    state.event.subEvents[0]?.id || ''
  );
  const [showAllRituals, setShowAllRituals] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);

  const [rituals, setRituals] = useState([
    { id: 'rit-1', name: 'Ganesh Sthapana & Mandap Muhurat', done: true },
    { id: 'rit-2', name: 'Mehendi Lagai & Folk Sangeet Antakshari', done: true },
    { id: 'rit-3', name: 'Haldi Ubtan & Floral Bath', done: false },
    { id: 'rit-4', name: 'Safa Tying & Baraat Departure Protocol', done: false },
    { id: 'rit-5', name: 'Varmala & Sunset Pheras by Lakefront', done: false },
    { id: 'rit-6', name: 'Kanyadaan, Sindoor Daan & Vidaai', done: false },
  ]);

  const toggleRitual = (id: string) => {
    setRituals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    );
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabRef.current) {
      tabRef.current.scrollBy({
        left: direction === 'left' ? -180 : 180,
        behavior: 'smooth',
      });
    }
  };

  const currentSubEvent = state.event.subEvents.find((s) => s.id === selectedSubEventId) || state.event.subEvents[0];
  const displayedRituals = showAllRituals ? rituals : rituals.slice(0, 4);

  return (
    <Card className="col-span-12 lg:col-span-8 p-5 sm:p-6 space-y-5 rounded-xl border border-stone-200/80 dark:border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/[0.08] pb-3.5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[#111113] dark:text-[#EDEDEF]">
            Wedding Itinerary & Cultural Ceremonies
          </h3>
          <p className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5">
            Multi-day ceremony sequence with VIP family traditions
          </p>
        </div>
        <span className="text-xs text-stone-400 dark:text-zinc-500">
          {state.event.subEvents.length} ceremonies
        </span>
      </div>

      {/* Sub-Event Selector Tabs with Scroll Controls */}
      <div className="relative flex items-center">
        <button
          onClick={() => scrollTabs('left')}
          className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] shrink-0 mr-1 transition-colors"
          aria-label="Scroll ceremonies left"
        >
          <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
        </button>

        <div
          ref={tabRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1"
        >
          {state.event.subEvents.map((sub) => {
            const isActive = currentSubEvent?.id === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubEventId(sub.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#6E79F5]/10 text-[#5D68E2] dark:text-[#6E79F5]'
                    : 'text-stone-600 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scrollTabs('right')}
          className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] shrink-0 ml-1 transition-colors"
          aria-label="Scroll ceremonies right"
        >
          <ChevronRight className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Active Sub-Event Overview */}
      {currentSubEvent && (
        <div className="p-4 rounded-lg border border-stone-200/80 dark:border-white/[0.08] bg-stone-50/50 dark:bg-white/[0.02] space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-semibold text-stone-900 dark:text-[#EDEDEF] text-sm">
              {currentSubEvent.name}
            </span>
            <div className="flex items-center gap-3 text-stone-500 dark:text-[#8B8B93]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{currentSubEvent.date}</span>
              </span>
              <span>{currentSubEvent.startTime} – {currentSubEvent.endTime}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-stone-500 dark:text-[#8B8B93] pt-1 border-t border-stone-200/60 dark:border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{currentSubEvent.venueName}</span>
            </div>
            <div className="flex items-center gap-1.5 tabular-nums">
              <Users className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{currentSubEvent.guestCount} guests expected</span>
            </div>
          </div>
          {currentSubEvent.notes && (
            <p className="text-[11px] text-stone-400 dark:text-zinc-500 italic pt-0.5">
              "{currentSubEvent.notes}"
            </p>
          )}
        </div>
      )}

      {/* Key Rituals & Traditions Tracker */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-700 dark:text-[#EDEDEF]">
            Traditional Ceremonies & VIP Protocol
          </span>
          <span className="text-xs text-stone-400 dark:text-zinc-500 tabular-nums">
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
              <span className="text-[11px] text-stone-400 dark:text-zinc-500">
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
    </Card>
  );
};

import React, { useState, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
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
    <Card className="col-span-12 lg:col-span-7 p-5 sm:p-6 space-y-5 rounded-2xl border-stone-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3.5">
        <div>
          <h3 className="text-base font-serif font-semibold text-[#18181B] dark:text-[#FAFAFA]">
            Wedding Itinerary & Cultural Ceremonies
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
            Multi-day ceremony sequence with VIP family traditions
          </p>
        </div>
        <Badge variant="indigo" size="sm">
          {state.event.subEvents.length} Ceremonies
        </Badge>
      </div>

      {/* Sub-Event Selector Tabs with Scroll Controls */}
      <div className="relative flex items-center">
        <button
          onClick={() => scrollTabs('left')}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 shrink-0 mr-1 transition-colors"
          aria-label="Scroll ceremonies left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={tabRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1"
        >
          {state.event.subEvents.map((sub) => {
            const isActive = currentSubEvent?.id === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubEventId(sub.id)}
                className={`text-xs px-3.5 py-2 rounded-xl font-medium shrink-0 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-950 dark:text-amber-200 border border-amber-500/30 font-semibold shadow-xs'
                    : 'bg-stone-100/80 hover:bg-stone-200/80 text-stone-600 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-300'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scrollTabs('right')}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 shrink-0 ml-1 transition-colors"
          aria-label="Scroll ceremonies right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Sub-Event Overview */}
      {currentSubEvent && (
        <div className="bg-stone-50/70 dark:bg-zinc-900/60 p-4 rounded-xl border border-stone-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-stone-900 dark:text-white">
              {currentSubEvent.name}
            </h4>
            <span className="text-xs font-mono tabular-nums font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
              {currentSubEvent.startTime} — {currentSubEvent.endTime}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600 dark:text-zinc-400">
              <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{currentSubEvent.date}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-zinc-400">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
              <span className="truncate">{currentSubEvent.venueName}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-zinc-400">
              <Users className="w-4 h-4 text-stone-400 shrink-0" />
              <span className="font-mono tabular-nums">{currentSubEvent.guestCount} Guests</span>
            </div>
          </div>

          {currentSubEvent.notes && (
            <p className="text-xs text-stone-600 dark:text-zinc-400 pt-2 border-t border-stone-200/60 dark:border-zinc-800/60 leading-relaxed">
              <strong className="text-stone-800 dark:text-zinc-200 font-medium">Highlight:</strong> {currentSubEvent.notes}
            </p>
          )}
        </div>
      )}

      {/* Cultural Ritual Checklist */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            VIP Family Ritual Verification
          </h4>
          <button
            onClick={() => setShowAllRituals(!showAllRituals)}
            className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium transition-colors"
          >
            <span>{showAllRituals ? 'Show fewer' : `Show all rituals (${rituals.length})`}</span>
            {showAllRituals ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {displayedRituals.map((r) => (
            <button
              key={r.id}
              onClick={() => toggleRitual(r.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all ${
                r.done
                  ? 'border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-stone-600 dark:text-zinc-400'
                  : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-stone-50 dark:hover:bg-zinc-800/60 text-stone-800 dark:text-zinc-200'
              }`}
            >
              {r.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-stone-300 dark:text-zinc-600 shrink-0" />
              )}
              <span className="font-medium leading-tight">
                {r.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

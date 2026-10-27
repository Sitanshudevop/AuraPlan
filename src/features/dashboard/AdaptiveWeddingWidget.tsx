import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Users, MapPin, CheckCircle2, Circle } from 'lucide-react';

export const AdaptiveWeddingWidget: React.FC = () => {
  const { state } = useWorkspace();
  const [selectedSubEventId, setSelectedSubEventId] = useState<string>(
    state.event.subEvents[0]?.id || ''
  );

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

  const currentSubEvent = state.event.subEvents.find((s) => s.id === selectedSubEventId) || state.event.subEvents[0];

  return (
    <Card className="col-span-12 lg:col-span-7 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#FAFAFA]">
            Wedding Itinerary & Cultural Ceremonies
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Multi-day ceremony sequence with VIP family traditions
          </p>
        </div>
        <Badge variant="indigo" size="sm">4 Sub-Events</Badge>
      </div>

      {/* Sub-Event Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {state.event.subEvents.map((sub) => {
          const isActive = currentSubEvent?.id === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubEventId(sub.id)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium shrink-0 transition-colors ${
                isActive
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300'
              }`}
            >
              {sub.name}
            </button>
          );
        })}
      </div>

      {/* Active Sub-Event Overview */}
      {currentSubEvent && (
        <div className="bg-stone-50 dark:bg-zinc-900/60 p-3.5 rounded-lg border border-stone-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-900 dark:text-white">
              {currentSubEvent.name}
            </h4>
            <span className="text-[11px] font-mono tabular-nums font-medium text-stone-500 dark:text-zinc-400">
              {currentSubEvent.startTime} — {currentSubEvent.endTime}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{currentSubEvent.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span className="truncate">{currentSubEvent.venueName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-zinc-400">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-mono tabular-nums">{currentSubEvent.guestCount} Guests</span>
            </div>
          </div>

          {currentSubEvent.notes && (
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 pt-1 border-t border-stone-200/60 dark:border-zinc-800/60">
              <span className="font-semibold text-stone-700 dark:text-zinc-300">Highlight:</span> {currentSubEvent.notes}
            </p>
          )}
        </div>
      )}

      {/* Cultural Ritual Checklist */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-2">
          VIP Family Ritual Verification
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {rituals.map((r) => (
            <button
              key={r.id}
              onClick={() => toggleRitual(r.id)}
              className="flex items-center gap-2 p-2 rounded-md border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/60 text-left text-xs transition-colors"
            >
              {r.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-stone-300 dark:text-zinc-600 shrink-0" />
              )}
              <span className={r.done ? 'line-through text-stone-400 dark:text-zinc-500' : 'text-stone-700 dark:text-zinc-300'}>
                {r.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

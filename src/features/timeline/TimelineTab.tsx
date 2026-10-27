import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { MacroCountdownView } from './MacroCountdownView';
import { DayOfRunOfShowView } from './DayOfRunOfShowView';
import { Button } from '../../components/ui/Button';
import { downloadIcsFile } from './IcsGenerator';
import { Calendar, Clock, Download } from 'lucide-react';

export const TimelineTab: React.FC = () => {
  const { state } = useWorkspace();
  const [activeView, setActiveView] = useState<'macro' | 'day_of'>('macro');

  const handleDownloadIcs = () => {
    downloadIcsFile(state.event, state.macroTasks, state.dayOfActivities);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Dual Horizon Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#18181B] dark:text-[#FAFAFA] tracking-tight">
            Dual-Horizon Timeline & "Day-Of" Run-of-Show
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Switch between macro countdown milestones and minute-by-minute operational run-of-show
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Horizon Switcher Tabs */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-zinc-700">
            <button
              onClick={() => setActiveView('macro')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeView === 'macro'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Macro Countdown</span>
            </button>
            <button
              onClick={() => setActiveView('day_of')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeView === 'day_of'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Day-Of Run-of-Show</span>
            </button>
          </div>

          {/* Real .ics Download */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadIcs}
            icon={<Download className="w-3.5 h-3.5" />}
            title="Download standard RFC 5545 .ics calendar file"
          >
            Export .ics
          </Button>
        </div>
      </div>

      {/* Render Active Timeline View */}
      {activeView === 'macro' ? <MacroCountdownView /> : <DayOfRunOfShowView />}
    </div>
  );
};

import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { MacroCountdownView } from './MacroCountdownView';
import { DayOfRunOfShowView } from './DayOfRunOfShowView';
import { PageHeader } from '../../components/ui/PageHeader';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { Button } from '../../components/ui/Button';
import { downloadIcsFile } from './IcsGenerator';
import { Download, Calendar, Clock } from 'lucide-react';

export const TimelineTab: React.FC = () => {
  const { state } = useWorkspace();
  const [activeView, setActiveView] = useState<'macro' | 'day_of'>('macro');

  const handleDownloadIcs = () => {
    downloadIcsFile(state.event, state.macroTasks, state.dayOfActivities);
  };

  const timelineTabs = [
    { id: 'macro', label: 'Macro Countdown', icon: <Calendar className="w-3.5 h-3.5 stroke-[1.5]" /> },
    { id: 'day_of', label: 'Day-Of Run-of-Show', icon: <Clock className="w-3.5 h-3.5 stroke-[1.5]" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dual-Horizon Timeline & &quot;Day-Of&quot; Run-of-Show"
        subtitle="Manage macro countdown milestones and minute-by-minute operational run-of-show"
        actions={
          <div className="flex items-center gap-3">
            <SegmentedTabs
              tabs={timelineTabs}
              activeTab={activeView}
              onChange={(id) => setActiveView(id as 'macro' | 'day_of')}
              variant="segmented"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadIcs}
              icon={<Download />}
              title="Download standard RFC 5545 .ics calendar file"
            >
              Export .ics
            </Button>
          </div>
        }
      />

      {activeView === 'macro' ? <MacroCountdownView /> : <DayOfRunOfShowView />}
    </div>
  );
};

import React, { Suspense, lazy } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/layout/CommandPalette';
import { Toast } from './components/ui/Toast';
import { TabSkeleton } from './components/ui/Skeleton';

// Lazy-loaded feature tabs with zero-lag chunking
const DashboardTab = lazy(() =>
  import('./features/dashboard/DashboardTab').then((m) => ({ default: m.DashboardTab }))
);
const BudgetTab = lazy(() =>
  import('./features/budget/BudgetTab').then((m) => ({ default: m.BudgetTab }))
);
const TimelineTab = lazy(() =>
  import('./features/timeline/TimelineTab').then((m) => ({ default: m.TimelineTab }))
);
const VendorsTab = lazy(() =>
  import('./features/vendors/VendorsTab').then((m) => ({ default: m.VendorsTab }))
);
const IdeationTab = lazy(() =>
  import('./features/ideation/IdeationTab').then((m) => ({ default: m.IdeationTab }))
);
const GuestsTab = lazy(() =>
  import('./features/guests/GuestsTab').then((m) => ({ default: m.GuestsTab }))
);
const AuditDrawer = lazy(() =>
  import('./features/audit/AuditDrawer').then((m) => ({ default: m.AuditDrawer }))
);
const RippleSimulatorDrawer = lazy(() =>
  import('./features/ideation/RippleSimulatorDrawer').then((m) => ({ default: m.RippleSimulatorDrawer }))
);
const PlanningAssistantDrawer = lazy(() =>
  import('./features/copilot/PlanningAssistantDrawer').then((m) => ({ default: m.PlanningAssistantDrawer }))
);
const NewEventModal = lazy(() =>
  import('./components/modals/NewEventModal').then((m) => ({ default: m.NewEventModal }))
);
const EditEventModal = lazy(() =>
  import('./components/modals/EditEventModal').then((m) => ({ default: m.EditEventModal }))
);

const MainWorkspaceContent: React.FC = () => {
  const { activeTab } = useWorkspace();
  const isVendors = activeTab === 'vendors';

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
      <main
        id="main-content"
        className={`flex-1 w-full min-h-0 min-w-0 ${
          isVendors
            ? 'p-4 sm:p-5 lg:p-6 max-w-none flex flex-col overflow-hidden'
            : 'p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto overflow-y-auto overflow-x-hidden space-y-8'
        }`}
        tabIndex={-1}
      >
        <Suspense fallback={<TabSkeleton />}>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'budget' && <BudgetTab />}
          {activeTab === 'timeline' && <TimelineTab />}
          {activeTab === 'vendors' && <VendorsTab />}
          {activeTab === 'ideation' && <IdeationTab />}
          {activeTab === 'guests' && <GuestsTab />}
        </Suspense>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WorkspaceProvider>
      {/* Skip to Main Workspace Link for WCAG 2.1 AA Compliance */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 px-4 py-2 bg-[#18181B] text-white rounded font-medium text-xs shadow-xs border border-stone-700"
      >
        Skip to main workspace
      </a>

      <div className="h-screen h-[100dvh] max-h-[100dvh] bg-[#FAF9F6] text-[#111113] dark:bg-[#0B0B0C] dark:text-[#EDEDEF] flex flex-col font-sans transition-colors duration-150 overflow-hidden">
        <Header />

        <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
          <Sidebar />
          <MainWorkspaceContent />
        </div>

        {/* Global Overlays & Modals */}
        <CommandPalette />
        <Suspense fallback={null}>
          <RippleSimulatorDrawer />
          <PlanningAssistantDrawer />
          <AuditDrawer />
          <NewEventModal />
          <EditEventModal />
        </Suspense>
        <Toast />
      </div>
    </WorkspaceProvider>
  );
};

export default App;

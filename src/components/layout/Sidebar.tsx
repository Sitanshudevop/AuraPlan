import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ActiveTab } from '../../types/state';
import { getDaysRemaining } from '../../utils/formatters';
import {
  LayoutDashboard,
  WalletCards,
  CalendarClock,
  Briefcase,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  Pencil,
  MapPin,
} from 'lucide-react';

interface TabItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
}

export const Sidebar: React.FC = () => {
  const { state, activeTab, setActiveTab, setEditEventModalOpen } = useWorkspace();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const daysLeft = getDaysRemaining(state.event.date);

  const navItems: TabItem[] = [
    { id: 'dashboard', label: 'Executive Bento', icon: <LayoutDashboard className="w-4 h-4 stroke-[1.5]" />, shortcut: '⌥1' },
    { id: 'budget', label: 'Smart Budget Engine', icon: <WalletCards className="w-4 h-4 stroke-[1.5]" />, shortcut: '⌥2' },
    { id: 'timeline', label: 'Timeline & Run-of-Show', icon: <CalendarClock className="w-4 h-4 stroke-[1.5]" />, shortcut: '⌥3' },
    { id: 'vendors', label: 'Vendor CRM & Studio', icon: <Briefcase className="w-4 h-4 stroke-[1.5]" />, shortcut: '⌥4' },
    { id: 'ideation', label: 'AI Ideation & Themes', icon: <Sparkles className="w-4 h-4 stroke-[1.5]" />, shortcut: '⌥5' },
    { id: 'guests', label: 'Guests & Capacity Matrix', icon: <Users className="w-4 h-4 stroke-[1.5]" />, shortcut: '⌥6' },
  ];

  const modalityLabel = state.event.type.charAt(0).toUpperCase() + state.event.type.slice(1);

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] sticky top-14 bg-[#FAF9F6] dark:bg-[#0B0B0C] border-r border-stone-200/80 dark:border-white/[0.08] transition-all duration-150 flex flex-col justify-between shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-[232px]'
      }`}
      aria-label="Workspace Navigation"
    >
      {/* Top: Quiet Event Header Block */}
      <div className="p-3.5 border-b border-stone-200/80 dark:border-white/[0.08]">
        {!isCollapsed ? (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-semibold tracking-tight truncate text-[#111113] dark:text-[#EDEDEF]" title={state.event.name}>
                  {state.event.name}
                </h1>
                <div className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5 truncate">
                  <span className="sr-only">{state.event.type.toUpperCase()} MODE</span>
                  <span>{modalityLabel} · {daysLeft} days to go</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-zinc-500 mt-1 truncate">
                  <MapPin className="w-3 h-3 stroke-[1.5] shrink-0" />
                  <span className="truncate">{state.event.city}</span>
                </div>
              </div>
              <button
                onClick={() => setEditEventModalOpen(true)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors shrink-0"
                title="Edit Event Details"
                aria-label="Edit event details"
              >
                <Pencil className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-1">
            <span className="text-xs font-semibold text-[#111113] dark:text-[#EDEDEF]">
              {modalityLabel.slice(0, 1)}
            </span>
            <span className="text-[11px] tabular-nums text-stone-500 dark:text-[#8B8B93]">{daysLeft}d</span>
          </div>
        )}
      </div>

      {/* Middle: Feature Nav Items */}
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative w-full h-9 flex items-center gap-2.5 px-2.5 rounded-lg text-sm transition-colors text-left ${
                isActive
                  ? 'bg-black/[0.05] dark:bg-white/[0.06] text-[#111113] dark:text-white font-medium before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#6E79F5] before:rounded-r'
                  : 'text-stone-600 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={`${item.label} (${item.shortcut})`}
            >
              <span className={`shrink-0 transition-colors ${isActive ? 'text-[#6E79F5]' : 'text-stone-400 group-hover:text-stone-600 dark:text-zinc-500 dark:group-hover:text-zinc-300'}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  <kbd className="text-[10px] text-stone-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.shortcut}
                  </kbd>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: Collapse Button & Status */}
      <div className="p-2.5 border-t border-stone-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs text-stone-400 dark:text-zinc-500">
        {!isCollapsed && (
          <span className="text-[11px] font-normal truncate">
            AuraPlan Workspace
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-stone-400 hover:text-stone-700 dark:text-zinc-500 dark:hover:text-zinc-200 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors ml-auto"
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 stroke-[1.5]" /> : <ChevronLeft className="w-4 h-4 stroke-[1.5]" />}
        </button>
      </div>
    </aside>
  );
};

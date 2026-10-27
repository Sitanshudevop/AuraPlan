import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ActiveTab } from '../../types/state';
import { Badge } from '../ui/Badge';
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
  Clock,
  MapPin,
} from 'lucide-react';

interface TabItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
}

export const Sidebar: React.FC = () => {
  const { state, activeTab, setActiveTab } = useWorkspace();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const daysLeft = getDaysRemaining(state.event.date);

  const navItems: TabItem[] = [
    { id: 'dashboard', label: 'Executive Bento', icon: <LayoutDashboard className="w-4 h-4" />, shortcut: '⌥1' },
    { id: 'budget', label: 'Smart Budget Engine', icon: <WalletCards className="w-4 h-4" />, shortcut: '⌥2' },
    { id: 'timeline', label: 'Timeline & Run-of-Show', icon: <CalendarClock className="w-4 h-4" />, shortcut: '⌥3' },
    { id: 'vendors', label: 'Vendor CRM & Studio', icon: <Briefcase className="w-4 h-4" />, shortcut: '⌥4' },
    { id: 'ideation', label: 'AI Ideation & Themes', icon: <Sparkles className="w-4 h-4" />, shortcut: '⌥5' },
    { id: 'guests', label: 'Guests & Capacity Matrix', icon: <Users className="w-4 h-4" />, shortcut: '⌥6' },
  ];

  const getBadgeVariant = (type: string) => {
    if (type === 'wedding') return 'indigo';
    if (type === 'birthday') return 'amber';
    return 'emerald';
  };

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] sticky top-14 bg-white dark:bg-[#121215] border-r border-stone-200 dark:border-zinc-800 transition-all duration-200 flex flex-col justify-between shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Workspace Navigation"
    >
      {/* Top: Event Context Summary */}
      <div className="p-3 border-b border-stone-200 dark:border-zinc-800">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant={getBadgeVariant(state.event.type)} size="sm">
                {state.event.type.toUpperCase()} MODE
              </Badge>
              <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-stone-500 dark:text-zinc-400">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{daysLeft}d left</span>
              </div>
            </div>
            <div>
              <h1 className="font-semibold text-xs tracking-tight truncate text-[#18181B] dark:text-[#FAFAFA]" title={state.event.name}>
                {state.event.name}
              </h1>
              <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{state.event.city}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Badge variant={getBadgeVariant(state.event.type)} size="sm">
              {state.event.type.slice(0, 1).toUpperCase()}
            </Badge>
            <span className="text-[10px] font-mono tabular-nums text-stone-500">{daysLeft}d</span>
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-stone-100 text-[#18181B] dark:bg-zinc-800 dark:text-white font-semibold'
                  : 'text-stone-600 hover:bg-stone-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={`${item.label} (${item.shortcut})`}
            >
              <span className={isActive ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-zinc-400'}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="truncate">{item.label}</span>
                  <kbd className="text-[9px] font-mono text-stone-400 dark:text-zinc-500 opacity-60">
                    {item.shortcut}
                  </kbd>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: Collapse Button & Status */}
      <div className="p-3 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="text-[10px] font-mono text-stone-400 dark:text-zinc-500">
            <span>AuraPlan v1.0 • AA Compliant</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors ml-auto"
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

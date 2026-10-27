import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Search,
  LayoutDashboard,
  WalletCards,
  CalendarClock,
  Briefcase,
  Sparkles,
  Users,
  Moon,
  Sun,
  ShieldCheck,
  RefreshCw,
  Plus,
  IndianRupee,
  DollarSign,
  Download,
  CheckCircle,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Presets' | 'Actions' | 'Vendors' | 'Tasks' | 'Settings';
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    state,
    setActiveTab,
    switchPreset,
    currency,
    setCurrency,
    isDark,
    toggleDarkMode,
    setAuditDrawerOpen,
    setCopilotOpen,
    setNewEventModalOpen,
    autoBalanceBudget,
    resetToFactoryDefaults,
    announce,
  } = useWorkspace();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const baseItems: PaletteItem[] = useMemo(() => [
    { id: 'nav-dash', title: 'Go to Executive Bento Dashboard', category: 'Navigation', icon: <LayoutDashboard className="w-4 h-4" />, action: () => setActiveTab('dashboard') },
    { id: 'nav-budget', title: 'Go to Smart Budget Engine', category: 'Navigation', icon: <WalletCards className="w-4 h-4" />, action: () => setActiveTab('budget') },
    { id: 'nav-timeline', title: 'Go to Dual-Horizon Timeline & Run-of-Show', category: 'Navigation', icon: <CalendarClock className="w-4 h-4" />, action: () => setActiveTab('timeline') },
    { id: 'nav-vendors', title: 'Go to Vendor CRM & Negotiation Studio', category: 'Navigation', icon: <Briefcase className="w-4 h-4" />, action: () => setActiveTab('vendors') },
    { id: 'nav-ideation', title: 'Go to AI Ideation & Themes Studio', category: 'Navigation', icon: <Sparkles className="w-4 h-4" />, action: () => setActiveTab('ideation') },
    { id: 'nav-guests', title: 'Go to Guest RSVP & Capacity Planner', category: 'Navigation', icon: <Users className="w-4 h-4" />, action: () => setActiveTab('guests') },

    { id: 'pre-wedding', title: 'Switch to Udaipur Royal Heritage Wedding (Wedding Mode)', category: 'Presets', icon: <Sparkles className="w-4 h-4 text-indigo-500" />, action: () => switchPreset('preset-wedding-udaipur') },
    { id: 'pre-birthday', title: 'Switch to Midnight Botanical 25th Milestone Gala (Birthday Mode)', category: 'Presets', icon: <Sparkles className="w-4 h-4 text-amber-500" />, action: () => switchPreset('preset-birthday-botanical') },
    { id: 'pre-community', title: 'Switch to Bengaluru Open-Source AI Builders Summit (Community Mode)', category: 'Presets', icon: <Sparkles className="w-4 h-4 text-emerald-500" />, action: () => switchPreset('preset-community-builders') },

    { id: 'act-ripple', title: 'Trigger "What-If" Ripple Simulator Drawer', category: 'Actions', icon: <Sparkles className="w-4 h-4 text-indigo-500" />, action: () => setCopilotOpen(true) },
    { id: 'act-audit', title: 'Open 100/100 System Diagnostic Audit Drawer', category: 'Actions', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, action: () => setAuditDrawerOpen(true) },
    { id: 'act-new-event', title: 'Create + New Custom Event with AI Synthesizer', category: 'Actions', icon: <Plus className="w-4 h-4" />, action: () => setNewEventModalOpen(true) },
    { id: 'act-balance', title: 'Auto-Balance Budget Allocations to 100%', category: 'Actions', icon: <RefreshCw className="w-4 h-4" />, action: () => autoBalanceBudget() },
    {
      id: 'act-export',
      title: 'Export Event Plan Backup (JSON)',
      category: 'Actions',
      icon: <Download className="w-4 h-4" />,
      action: () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `${state.event.name.toLowerCase().replace(/\s+/g, '-')}-plan.json`;
        a.click();
        announce('Exported event plan backup');
      },
    },

    { id: 'act-currency', title: `Toggle Currency (Currently ${currency})`, category: 'Settings', icon: currency === 'INR' ? <DollarSign className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />, action: () => setCurrency(currency === 'INR' ? 'USD' : 'INR') },
    { id: 'act-theme', title: `Toggle Dark / Light Mode (Currently ${isDark ? 'Dark' : 'Light'})`, category: 'Settings', icon: isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, action: () => toggleDarkMode() },
    { id: 'act-reset', title: 'Reset Workspace to Factory Presets', category: 'Settings', icon: <RefreshCw className="w-4 h-4 text-rose-500" />, action: () => resetToFactoryDefaults() },
  ], [setActiveTab, switchPreset, setCopilotOpen, setAuditDrawerOpen, setNewEventModalOpen, autoBalanceBudget, currency, setCurrency, isDark, toggleDarkMode, resetToFactoryDefaults, state, announce]);

  // Dynamic searchable vendors and tasks
  const dynamicItems: PaletteItem[] = useMemo(() => {
    const vendorItems: PaletteItem[] = state.vendors.map((v) => ({
      id: `vendor-${v.id}`,
      title: `Vendor: ${v.name} (${v.category.toUpperCase()} • ${v.status.replace('_', ' ')})`,
      category: 'Vendors',
      icon: <Briefcase className="w-3.5 h-3.5 text-stone-400" />,
      action: () => setActiveTab('vendors'),
    }));

    const taskItems: PaletteItem[] = state.macroTasks.map((t) => ({
      id: `task-${t.id}`,
      title: `Task: ${t.title} [${t.priority.toUpperCase()}]`,
      category: 'Tasks',
      icon: <CheckCircle className="w-3.5 h-3.5 text-stone-400" />,
      action: () => setActiveTab('timeline'),
    }));

    return [...vendorItems, ...taskItems];
  }, [state.vendors, state.macroTasks, setActiveTab]);

  const allItems = useMemo(() => [...baseItems, ...dynamicItems], [baseItems, dynamicItems]);

  const filtered = useMemo(() => {
    if (!query.trim()) return baseItems;
    const q = query.toLowerCase().trim();
    return allItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [allItems, baseItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation: ArrowUp, ArrowDown, Enter, Escape
  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          setCommandPaletteOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filtered, selectedIndex, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={() => setCommandPaletteOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#121215] border border-stone-200/90 dark:border-zinc-800 rounded-xl shadow-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200/80 dark:border-zinc-800">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search vendor or task (↑↓ to navigate, ↵ to run)..."
            className="flex-1 bg-transparent text-xs text-[#18181B] dark:text-[#FAFAFA] placeholder:text-stone-400 outline-none"
            autoFocus
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-100 dark:bg-zinc-800 text-stone-500 rounded border border-stone-200 dark:border-zinc-700 shrink-0">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto p-2 space-y-0.5 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No matching actions, vendors, or tasks found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
                    isSelected
                      ? 'bg-stone-100 text-[#18181B] dark:bg-zinc-800 dark:text-white font-semibold'
                      : 'text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className={isSelected ? 'text-stone-900 dark:text-white shrink-0' : 'text-stone-400 shrink-0'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 dark:text-zinc-500 uppercase shrink-0">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

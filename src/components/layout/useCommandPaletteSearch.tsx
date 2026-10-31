import { useState, useMemo, useEffect } from 'react';
import { EventWorkspaceState } from '../../types/state';
import { Currency } from '../../types/event';
import { Briefcase, CheckCircle } from 'lucide-react';
import { buildBasePaletteItems, PaletteItem } from './commandPaletteItems';

type ActiveTab = 'dashboard' | 'budget' | 'timeline' | 'vendors' | 'guests' | 'ideation';

interface UseCommandPaletteSearchProps {
  isOpen: boolean;
  onClose: () => void;
  state: EventWorkspaceState;
  currency: Currency;
  isDark: boolean;
  setActiveTab: (tab: ActiveTab) => void;
  switchPreset: (id: string) => void;
  setCurrency: (c: Currency) => void;
  toggleDarkMode: () => void;
  setAuditDrawerOpen: (v: boolean) => void;
  setCopilotOpen: (v: boolean) => void;
  setAssistantOpen: (v: boolean) => void;
  setNewEventModalOpen: (v: boolean) => void;
  autoBalanceBudget: () => void;
  resetToFactoryDefaults: () => void;
  announce: (msg: string) => void;
}

export function useCommandPaletteSearch({
  isOpen,
  onClose,
  state,
  currency,
  isDark,
  setActiveTab,
  switchPreset,
  setCurrency,
  toggleDarkMode,
  setAuditDrawerOpen,
  setCopilotOpen,
  setAssistantOpen,
  setNewEventModalOpen,
  autoBalanceBudget,
  resetToFactoryDefaults,
  announce,
}: UseCommandPaletteSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const baseItems: PaletteItem[] = useMemo(
    () =>
      buildBasePaletteItems({
        state,
        currency,
        isDark,
        setActiveTab,
        switchPreset,
        setCurrency,
        toggleDarkMode,
        setAuditDrawerOpen,
        setCopilotOpen,
        setAssistantOpen,
        setNewEventModalOpen,
        autoBalanceBudget,
        resetToFactoryDefaults,
        announce,
      }),
    [state, currency, isDark, setActiveTab, switchPreset, setCurrency, toggleDarkMode, setAuditDrawerOpen, setCopilotOpen, setAssistantOpen, setNewEventModalOpen, autoBalanceBudget, resetToFactoryDefaults, announce]
  );

  const dynamicItems: PaletteItem[] = useMemo(() => {
    const vendorItems: PaletteItem[] = state.vendors.map((v) => ({
      id: `vendor-${v.id}`,
      title: `Vendor: ${v.name} (${v.category.toUpperCase()} • ${v.status.replace('_', ' ')})`,
      category: 'Vendors',
      icon: <Briefcase className="w-3.5 h-3.5 text-stone-500" />,
      action: () => setActiveTab('vendors'),
    }));

    const taskItems: PaletteItem[] = state.macroTasks.map((t) => ({
      id: `task-${t.id}`,
      title: `Task: ${t.title} [${t.priority.toUpperCase()}]`,
      category: 'Tasks',
      icon: <CheckCircle className="w-3.5 h-3.5 text-stone-500" />,
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
    if (!isOpen) return;

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
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  return {
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    filtered,
  };
}

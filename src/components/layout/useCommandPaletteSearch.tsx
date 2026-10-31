import { useState, useMemo, useEffect } from 'react';
import { EventWorkspaceState } from '../../types/state';
import { Currency } from '../../types/event';
import {
  buildBasePaletteItems,
  buildDynamicPaletteItems,
  PaletteItem,
} from './commandPaletteItems';
import { useCommandPaletteKeyboard } from './useCommandPaletteKeyboard';

type ActiveTab = 'dashboard' | 'budget' | 'timeline' | 'vendors' | 'guests' | 'ideation';

export interface UseCommandPaletteSearchProps {
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

export function useCommandPaletteSearch(props: UseCommandPaletteSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const baseItems: PaletteItem[] = useMemo(
    () => buildBasePaletteItems(props),
    [props]
  );

  const dynamicItems: PaletteItem[] = useMemo(
    () => buildDynamicPaletteItems(props.state.vendors, props.state.macroTasks, props.setActiveTab),
    [props.state.vendors, props.state.macroTasks, props.setActiveTab]
  );

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

  useCommandPaletteKeyboard(props.isOpen, filtered, selectedIndex, setSelectedIndex, props.onClose);

  return {
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    filtered,
  };
}

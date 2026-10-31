import React, { createContext, useContext, useState, useReducer, useCallback, useMemo } from 'react';
import { EventWorkspaceState, ActiveTab } from '../types/state';
import { Currency } from '../types/event';
import { INITIAL_PRESETS } from '../data/presets';
import { rootWorkspaceReducer } from '../state/rootReducer';
import { loadPersistedState } from '../utils/storage';
import { WorkspaceContextType } from './WorkspaceContextTypes';
import { useTheme, useKeyboardShortcuts } from '../hooks';
import { useWorkspacePersistence } from './workspaceStorageSync';
import { useWorkspaceOverlays } from './useWorkspaceOverlays';
import { useWorkspaceDispatchers } from './useWorkspaceDispatchers';


const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const persisted = useMemo(() => loadPersistedState(), []);
  const initialPresetId = persisted?.activePresetId || 'preset-wedding-udaipur';
  const initialData = persisted?.states[initialPresetId] || INITIAL_PRESETS[initialPresetId];

  const [activePresetId, setActivePresetId] = useState<string>(initialPresetId);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currency, setCurrency] = useState<Currency>(initialData.event.currency || 'INR');
  const { isDark, toggleDarkMode } = useTheme(persisted?.theme === 'dark');
  const [history, setHistory] = useState<EventWorkspaceState[]>([]);
  const [announcerMessage, setAnnouncerMessage] = useState('');

  const overlays = useWorkspaceOverlays();
  const [state, dispatch] = useReducer(rootWorkspaceReducer, initialData);

  const announce = useCallback((msg: string): void => setAnnouncerMessage(msg), []);

  useWorkspacePersistence(state, activePresetId, isDark);

  const dispatchers = useWorkspaceDispatchers({
    state,
    dispatch,
    history,
    setHistory,
    setActivePresetId,
    setCurrency,
    announce,
  });

  const selectTabByIndex = useCallback((index: number): void => {
    const tabs: ActiveTab[] = ['dashboard', 'budget', 'timeline', 'vendors', 'ideation', 'guests'];
    if (index >= 0 && index < tabs.length) setActiveTab(tabs[index]);
  }, []);

  useKeyboardShortcuts({
    onToggleCommandPalette: overlays.toggleCommandPalette,
    onCloseOverlays: overlays.closeAllOverlays,
    onSelectTabByIndex: selectTabByIndex,
  });

  const value = useMemo(
    () => ({
      state,
      activePresetId,
      activeTab,
      currency,
      isDark,
      canUndo: history.length > 0,
      ...overlays,
      announcerMessage,
      setActiveTab,
      setCurrency,
      toggleDarkMode,
      ...dispatchers,
      announce,
    }),
    [
      state,
      activePresetId,
      activeTab,
      currency,
      isDark,
      history.length,
      overlays,
      announcerMessage,
      setActiveTab,
      setCurrency,
      toggleDarkMode,
      dispatchers,
      announce,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcerMessage}
      </div>
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};

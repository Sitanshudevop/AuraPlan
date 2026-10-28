import React, { createContext, useContext, useState, useReducer, useCallback, useMemo } from 'react';
import { EventWorkspaceState, ActiveTab } from '../types/state';
import { Currency, EventData } from '../types/event';
import { BudgetItem } from '../types/budget';
import { Vendor } from '../types/vendor';
import { MacroTask, DayOfActivity } from '../types/timeline';
import { Guest } from '../types/guest';
import { RippleDiffResult } from '../types/ripple';
import { INITIAL_PRESETS } from '../data/presets';
import { workspaceReducer } from './workspaceReducer';
import { loadPersistedState, clearPersistedState } from '../utils/storage';
import { WorkspaceContextType } from './WorkspaceContextTypes';
import { useTheme, useKeyboardShortcuts } from '../hooks';
import { useWorkspacePersistence } from './workspaceStorageSync';

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
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isAuditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [isCopilotOpen, setCopilotOpen] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [isNewEventModalOpen, setNewEventModalOpen] = useState(false);
  const [announcerMessage, setAnnouncerMessage] = useState('');

  const [state, dispatch] = useReducer(workspaceReducer, initialData);

  const announce = useCallback((msg: string) => setAnnouncerMessage(msg), []);

  useWorkspacePersistence(state, activePresetId, isDark);

  const pushHistory = useCallback((curr: EventWorkspaceState) => {
    setHistory((prev) => [...prev.slice(-9), curr]);
  }, []);

  const switchPreset = useCallback((presetId: string) => {
    const target = INITIAL_PRESETS[presetId];
    if (target) {
      setActivePresetId(presetId);
      dispatch({ type: 'LOAD_STATE', payload: target });
      setCurrency(target.event.currency);
      announce(`Switched to ${target.event.name}`);
    }
  }, [announce]);

  const setCustomState = useCallback((newState: EventWorkspaceState) => {
    pushHistory(state);
    setActivePresetId(newState.event.id);
    dispatch({ type: 'LOAD_STATE', payload: newState });
    setCurrency(newState.event.currency);
    announce(`Loaded custom event: ${newState.event.name}`);
  }, [state, pushHistory, announce]);

  const updateEvent = useCallback((payload: Partial<EventData>) => dispatch({ type: 'UPDATE_EVENT', payload }), []);
  const updateMacroTask = useCallback((id: string, partial: Partial<MacroTask>) => dispatch({ type: 'UPDATE_TASK', payload: { id, partial } }), []);
  const updateDayOfActivity = useCallback((id: string, partial: Partial<DayOfActivity>) => dispatch({ type: 'UPDATE_ACTIVITY', payload: { id, partial } }), []);
  const updateGuest = useCallback((id: string, partial: Partial<Guest>) => dispatch({ type: 'UPDATE_GUEST', payload: { id, partial } }), []);

  const updateBudgetItem = useCallback((id: string, partial: Partial<BudgetItem>) => {
    dispatch({ type: 'UPDATE_BUDGET_ITEM', payload: { id, partial } });
    announce('Budget item updated');
  }, [announce]);

  const autoBalanceBudget = useCallback(() => {
    pushHistory(state);
    dispatch({ type: 'AUTO_BALANCE_BUDGET' });
    announce('Budget auto-balanced to 100%');
  }, [state, pushHistory, announce]);

  const addBudgetItem = useCallback((item: BudgetItem) => {
    pushHistory(state);
    dispatch({ type: 'ADD_BUDGET_ITEM', payload: item });
    announce(`Added budget line: ${item.name}`);
  }, [state, pushHistory, announce]);

  const updateVendor = useCallback((id: string, partial: Partial<Vendor>) => {
    dispatch({ type: 'UPDATE_VENDOR', payload: { id, partial } });
    announce('Vendor details updated and synced to budget');
  }, [announce]);

  const addVendor = useCallback((vendor: Vendor) => {
    pushHistory(state);
    dispatch({ type: 'ADD_VENDOR', payload: vendor });
    announce(`Vendor added: ${vendor.name}`);
  }, [state, pushHistory, announce]);

  const addMacroTask = useCallback((task: MacroTask) => {
    pushHistory(state);
    dispatch({ type: 'ADD_TASK', payload: task });
    announce(`Task scheduled: ${task.title}`);
  }, [state, pushHistory, announce]);

  const addDayOfActivity = useCallback((activity: DayOfActivity) => {
    pushHistory(state);
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    announce(`Activity added: ${activity.title}`);
  }, [state, pushHistory, announce]);

  const shiftActivity30m = useCallback((id: string) => {
    pushHistory(state);
    dispatch({ type: 'SHIFT_ACTIVITY_30M', payload: { id } });
    announce('Resolved conflict by shifting activity by 30 minutes');
  }, [state, pushHistory, announce]);

  const addGuest = useCallback((guest: Guest) => {
    pushHistory(state);
    dispatch({ type: 'ADD_GUEST', payload: guest });
    announce(`Guest added: ${guest.name}`);
  }, [state, pushHistory, announce]);

  const deleteGuest = useCallback((id: string) => {
    pushHistory(state);
    dispatch({ type: 'DELETE_GUEST', payload: { id } });
    announce('Guest removed');
  }, [state, pushHistory, announce]);

  const applyRipple = useCallback((diff: RippleDiffResult) => {
    pushHistory(state);
    dispatch({ type: 'APPLY_RIPPLE', payload: diff });
    announce(`Ripple applied: ${diff.scenarioTitle}`);
  }, [state, pushHistory, announce]);

  const undoLastRipple = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      dispatch({ type: 'LOAD_STATE', payload: prev });
      announce('Reverted last ripple modification');
    }
  }, [history, announce]);

  const resetToFactoryDefaults = useCallback(() => {
    clearPersistedState();
    setActivePresetId('preset-wedding-udaipur');
    dispatch({ type: 'LOAD_STATE', payload: INITIAL_PRESETS['preset-wedding-udaipur'] });
    setHistory([]);
    announce('Workspace restored to factory presets');
  }, [announce]);

  const toggleTax = useCallback((include: boolean) => dispatch({ type: 'TOGGLE_TAX', payload: include }), []);
  const setTaxRate = useCallback((rate: number) => dispatch({ type: 'SET_TAX_RATE', payload: rate }), []);

  const closeAllOverlays = useCallback(() => {
    setCommandPaletteOpen(false); setAuditDrawerOpen(false); setCopilotOpen(false);
    setAssistantOpen(false); setNewEventModalOpen(false);
  }, []);

  const toggleCommandPalette = useCallback(() => setCommandPaletteOpen((p) => !p), []);

  const selectTabByIndex = useCallback((index: number) => {
    const tabs: ActiveTab[] = ['dashboard', 'budget', 'timeline', 'vendors', 'ideation', 'guests'];
    if (index >= 0 && index < tabs.length) setActiveTab(tabs[index]);
  }, []);

  useKeyboardShortcuts({ onToggleCommandPalette: toggleCommandPalette, onCloseOverlays: closeAllOverlays, onSelectTabByIndex: selectTabByIndex });

  const value = useMemo(
    () => ({
      state, activePresetId, activeTab, currency, isDark, canUndo: history.length > 0,
      isCommandPaletteOpen, isAuditDrawerOpen, isCopilotOpen, isAssistantOpen, isNewEventModalOpen, announcerMessage,
      setActiveTab, setCurrency, toggleDarkMode, switchPreset, setCustomState, updateEvent,
      updateBudgetItem, autoBalanceBudget, addBudgetItem, updateVendor, addVendor, updateMacroTask,
      addMacroTask, updateDayOfActivity, addDayOfActivity, shiftActivity30m, updateGuest, addGuest,
      deleteGuest, applyRipple, undoLastRipple, resetToFactoryDefaults, toggleTax, setTaxRate,
      setCommandPaletteOpen, setAuditDrawerOpen, setCopilotOpen, setAssistantOpen, setNewEventModalOpen, announce,
    }),
    [
      state, activePresetId, activeTab, currency, isDark, history.length,
      isCommandPaletteOpen, isAuditDrawerOpen, isCopilotOpen, isAssistantOpen, isNewEventModalOpen, announcerMessage,
      setActiveTab, setCurrency, toggleDarkMode, switchPreset, setCustomState, updateEvent,
      updateBudgetItem, autoBalanceBudget, addBudgetItem, updateVendor, addVendor, updateMacroTask,
      addMacroTask, updateDayOfActivity, addDayOfActivity, shiftActivity30m, updateGuest, addGuest,
      deleteGuest, applyRipple, undoLastRipple, resetToFactoryDefaults, toggleTax, setTaxRate, announce,
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

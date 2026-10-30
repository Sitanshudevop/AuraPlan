import { useCallback } from 'react';
import { EventWorkspaceState } from '../types/state';
import { WorkspaceAction } from '../state/types';
import { Currency, EventData } from '../types/event';
import { BudgetItem } from '../types/budget';
import { Vendor } from '../types/vendor';
import { MacroTask, DayOfActivity } from '../types/timeline';
import { Guest } from '../types/guest';
import { RippleDiffResult } from '../types/ripple';
import { INITIAL_PRESETS } from '../data/presets';
import { clearPersistedState } from '../utils/storage';

interface DispatcherDeps {
  state: EventWorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
  history: EventWorkspaceState[];
  setHistory: React.Dispatch<React.SetStateAction<EventWorkspaceState[]>>;
  setActivePresetId: (id: string) => void;
  setCurrency: (c: Currency) => void;
  announce: (msg: string) => void;
}

export function useWorkspaceDispatchers({
  state,
  dispatch,
  history,
  setHistory,
  setActivePresetId,
  setCurrency,
  announce,
}: DispatcherDeps) {
  const pushHistory = useCallback(
    (curr: EventWorkspaceState): void => {
      setHistory((prev) => [...prev.slice(-9), curr]);
    },
    [setHistory]
  );

  const switchPreset = useCallback(
    (presetId: string): void => {
      const target = INITIAL_PRESETS[presetId];
      if (target) {
        setActivePresetId(presetId);
        dispatch({ type: 'LOAD_STATE', payload: target });
        setCurrency(target.event.currency);
        announce(`Switched to ${target.event.name}`);
      }
    },
    [setActivePresetId, dispatch, setCurrency, announce]
  );

  const setCustomState = useCallback(
    (newState: EventWorkspaceState): void => {
      pushHistory(state);
      setActivePresetId(newState.event.id);
      dispatch({ type: 'LOAD_STATE', payload: newState });
      setCurrency(newState.event.currency);
      announce(`Loaded custom event: ${newState.event.name}`);
    },
    [state, pushHistory, setActivePresetId, dispatch, setCurrency, announce]
  );

  const updateEvent = useCallback((payload: Partial<EventData>): void => dispatch({ type: 'UPDATE_EVENT', payload }), [dispatch]);
  const updateMacroTask = useCallback((id: string, partial: Partial<MacroTask>): void => dispatch({ type: 'UPDATE_TASK', payload: { id, partial } }), [dispatch]);
  const updateDayOfActivity = useCallback((id: string, partial: Partial<DayOfActivity>): void => dispatch({ type: 'UPDATE_ACTIVITY', payload: { id, partial } }), [dispatch]);
  const updateGuest = useCallback((id: string, partial: Partial<Guest>): void => dispatch({ type: 'UPDATE_GUEST', payload: { id, partial } }), [dispatch]);

  const updateBudgetItem = useCallback((id: string, partial: Partial<BudgetItem>): void => {
    dispatch({ type: 'UPDATE_BUDGET_ITEM', payload: { id, partial } });
    announce('Budget item updated');
  }, [dispatch, announce]);

  const autoBalanceBudget = useCallback((): void => {
    pushHistory(state);
    dispatch({ type: 'AUTO_BALANCE_BUDGET' });
    announce('Budget auto-balanced to 100%');
  }, [state, pushHistory, dispatch, announce]);

  const addBudgetItem = useCallback((item: BudgetItem): void => {
    pushHistory(state);
    dispatch({ type: 'ADD_BUDGET_ITEM', payload: item });
    announce(`Added budget line: ${item.name}`);
  }, [state, pushHistory, dispatch, announce]);

  const updateVendor = useCallback((id: string, partial: Partial<Vendor>): void => {
    dispatch({ type: 'UPDATE_VENDOR', payload: { id, partial } });
    announce('Vendor details updated and synced to budget');
  }, [dispatch, announce]);

  const addVendor = useCallback((vendor: Vendor): void => {
    pushHistory(state);
    dispatch({ type: 'ADD_VENDOR', payload: vendor });
    announce(`Vendor added: ${vendor.name}`);
  }, [state, pushHistory, dispatch, announce]);

  const addMacroTask = useCallback((task: MacroTask): void => {
    pushHistory(state);
    dispatch({ type: 'ADD_TASK', payload: task });
    announce(`Task scheduled: ${task.title}`);
  }, [state, pushHistory, dispatch, announce]);

  const addDayOfActivity = useCallback((activity: DayOfActivity): void => {
    pushHistory(state);
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    announce(`Activity added: ${activity.title}`);
  }, [state, pushHistory, dispatch, announce]);

  const shiftActivity30m = useCallback((id: string): void => {
    pushHistory(state);
    dispatch({ type: 'SHIFT_ACTIVITY_30M', payload: { id } });
    announce('Resolved conflict by shifting activity by 30 minutes');
  }, [state, pushHistory, dispatch, announce]);

  const addGuest = useCallback((guest: Guest): void => {
    pushHistory(state);
    dispatch({ type: 'ADD_GUEST', payload: guest });
    announce(`Guest added: ${guest.name}`);
  }, [state, pushHistory, dispatch, announce]);

  const deleteGuest = useCallback((id: string): void => {
    pushHistory(state);
    dispatch({ type: 'DELETE_GUEST', payload: { id } });
    announce('Guest removed');
  }, [state, pushHistory, dispatch, announce]);

  const deleteBudgetItem = useCallback((id: string): void => {
    pushHistory(state);
    dispatch({ type: 'DELETE_BUDGET_ITEM', payload: { id } });
    announce('Budget item removed');
  }, [state, pushHistory, dispatch, announce]);

  const deleteVendor = useCallback((id: string): void => {
    pushHistory(state);
    dispatch({ type: 'DELETE_VENDOR', payload: { id } });
    announce('Vendor removed');
  }, [state, pushHistory, dispatch, announce]);

  const deleteMacroTask = useCallback((id: string): void => {
    pushHistory(state);
    dispatch({ type: 'DELETE_TASK', payload: { id } });
    announce('Task removed');
  }, [state, pushHistory, dispatch, announce]);

  const deleteDayOfActivity = useCallback((id: string): void => {
    pushHistory(state);
    dispatch({ type: 'DELETE_ACTIVITY', payload: { id } });
    announce('Activity removed');
  }, [state, pushHistory, dispatch, announce]);

  const applyRipple = useCallback((diff: RippleDiffResult): void => {
    pushHistory(state);
    dispatch({ type: 'APPLY_RIPPLE', payload: diff });
    announce(`Ripple applied: ${diff.scenarioTitle}`);
  }, [state, pushHistory, dispatch, announce]);

  const undoLastRipple = useCallback((): void => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      dispatch({ type: 'LOAD_STATE', payload: prev });
      announce('Reverted last ripple modification');
    }
  }, [history, setHistory, dispatch, announce]);

  const resetToFactoryDefaults = useCallback((): void => {
    clearPersistedState();
    setActivePresetId('preset-wedding-udaipur');
    dispatch({ type: 'LOAD_STATE', payload: INITIAL_PRESETS['preset-wedding-udaipur'] });
    setHistory([]);
    announce('Workspace restored to factory presets');
  }, [setActivePresetId, dispatch, setHistory, announce]);

  const toggleTax = useCallback((include: boolean): void => dispatch({ type: 'TOGGLE_TAX', payload: include }), [dispatch]);
  const setTaxRate = useCallback((rate: number): void => dispatch({ type: 'SET_TAX_RATE', payload: rate }), [dispatch]);

  return {
    switchPreset,
    setCustomState,
    updateEvent,
    updateMacroTask,
    updateDayOfActivity,
    updateGuest,
    updateBudgetItem,
    autoBalanceBudget,
    addBudgetItem,
    deleteBudgetItem,
    updateVendor,
    addVendor,
    deleteVendor,
    addMacroTask,
    deleteMacroTask,
    addDayOfActivity,
    deleteDayOfActivity,
    shiftActivity30m,
    addGuest,
    deleteGuest,
    applyRipple,
    undoLastRipple,
    resetToFactoryDefaults,
    toggleTax,
    setTaxRate,
  };
}

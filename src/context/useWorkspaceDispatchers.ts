import { useCallback } from 'react';
import { EventWorkspaceState } from '../types/state';
import { WorkspaceAction } from '../state/types';
import { Currency } from '../types/event';
import { RippleDiffResult } from '../types/ripple';
import { INITIAL_PRESETS } from '../data/presets';
import { clearPersistedState } from '../utils/storage';
import { useCrudDispatchers } from './useCrudDispatchers';

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

  const crud = useCrudDispatchers({
    state,
    dispatch,
    pushHistory,
    announce,
  });

  return {
    switchPreset,
    setCustomState,
    applyRipple,
    undoLastRipple,
    resetToFactoryDefaults,
    ...crud,
  };
}

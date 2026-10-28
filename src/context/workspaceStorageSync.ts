import { useEffect } from 'react';
import { EventWorkspaceState } from '../types/state';
import { savePersistedState } from '../utils/storage';

export const useWorkspacePersistence = (
  state: EventWorkspaceState,
  activePresetId: string,
  isDark: boolean
): void => {
  useEffect(() => {
    const timer = setTimeout(() => {
      savePersistedState({
        version: 1,
        activePresetId,
        states: { [activePresetId]: state },
        theme: isDark ? 'dark' : 'light',
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [state, activePresetId, isDark]);
};


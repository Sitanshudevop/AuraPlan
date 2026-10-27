import { useState, useEffect, useCallback } from 'react';

export interface UseThemeReturn {
  isDark: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

/**
 * Custom hook to manage dark/light theme state and sync with the document root class.
 */
export function useTheme(initialDark = false): UseThemeReturn {
  const [isDark, setIsDark] = useState<boolean>(initialDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const setDarkMode = useCallback((enabled: boolean) => {
    setIsDark(enabled);
  }, []);

  return { isDark, toggleDarkMode, setDarkMode };
}

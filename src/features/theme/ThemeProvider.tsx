import type React from 'react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ThemeContext } from './ThemeContext';
import type { ThemeMode, ResolvedTheme } from './types';

const STORAGE_KEY = 'co-split:theme';
const VALID_THEMES: ThemeMode[] = ['light', 'dark', 'system'];

const isValidTheme = (value: string | null): value is ThemeMode =>
  typeof value === 'string' && VALID_THEMES.includes(value as ThemeMode);

const readStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';

  const storedTheme = localStorage.getItem(STORAGE_KEY);
  return isValidTheme(storedTheme) ? storedTheme : 'system';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredTheme());

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    if (!VALID_THEMES.includes(newTheme)) {
      return;
    }

    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

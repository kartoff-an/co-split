import type React from 'react';
import { useTheme } from '../features/theme/useTheme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border-subtle bg-surface-subtle text-text-secondary shadow-2xs transition-all duration-200 hover:border-border-strong hover:bg-surface hover:text-text-primary active:scale-95 ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <MoonIcon className="h-4 w-4 text-text-secondary transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
};

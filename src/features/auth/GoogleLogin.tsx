import type React from 'react';
import { useState } from 'react';
import * as authService from './authService';
import { Spinner } from '../../components/Spinner';

export const GoogleLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      console.error('Google sign in failed:', err);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="border-border-subtle bg-surface text-text-primary hover:bg-surface-subtle flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-xs transition-all duration-200 hover:shadow-sm active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
    >
      {isLoading ? (
        <Spinner className="text-text-muted h-5 w-5" />
      ) : (
        <img
          src="/icons/google-icon.svg"
          alt="Google logo"
          className="h-5 w-5 shrink-0"
        />
      )}
      <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
    </button>
  );
};

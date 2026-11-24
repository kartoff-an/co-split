import type React from 'react';
import { useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '@/types';
import * as authService from './authService';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authInitLoading, setAuthInitLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;

    authService
      .getSession()
      .then((initialSession) => {
        if (!mounted || authEventReceived) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      })
      .catch((error: unknown) => {
        console.error('Failed to restore authentication session:', error);
      })
      .finally(() => {
        if (mounted) setAuthInitLoading(false);
      });

    const subscription = authService.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;

      authEventReceived = true;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }

      setAuthInitLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const profileQuery = useQuery<UserProfile>({
    queryKey: ['user-profile', user?.id],
    queryFn: authService.getUserProfile,
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 15, // Cache profile for 15 minutes
    gcTime: 1000 * 60 * 60, // Retain in memory for 1 hour
  });

  const signOut = async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    queryClient.clear();
  };
  const profileError = profileQuery.error instanceof Error ? profileQuery.error : null;
  const loading = authInitLoading || (!!user && profileQuery.isLoading);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile: profileQuery.data ?? null,
        profileError,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

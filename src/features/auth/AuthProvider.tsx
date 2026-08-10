import type React from 'react';
import { useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../../types';
import * as authService from './authService';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authInitLoading, setAuthInitLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    authService.getSession().then((initialSession) => {
      if (!mounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setAuthInitLoading(false);
    });

    const subscription = authService.onAuthStateChange(
      (_event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setAuthInitLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const { data: profile = null, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const data = await authService.getUserProfile(user.id);
        if (data) return data;
      } catch (err) {
        console.error('Error fetching user profile from database:', err);
      }

      // Fallback to metadata if DB row not available
      return {
        id: user.id,
        display_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          'New User',
        avatar_url: user.user_metadata?.avatar_url || null,
        email: user.email || '',
        created_at: user.created_at,
      } as UserProfile;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 15, // Cache profile for 15 minutes
    gcTime: 1000 * 60 * 60, // Retain in memory for 1 hour
  });

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    queryClient.clear();
  };

  const loading = authInitLoading || (!!user && profileLoading && !profile);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

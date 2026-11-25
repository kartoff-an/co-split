import { supabase } from '@/lib/supabase';
import { api } from '@/api/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { UserProfile } from '@/api/types';

export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  return user;
};

export const getSession = async (): Promise<Session | null> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  return session;
};

export const onAuthStateChange = (
  callback: (event: AuthChangeEvent, session: Session | null) => void
): { unsubscribe: () => void } => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
};

export const signInWithGoogle = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>(API_ENDPOINTS.users.me);

  return response.data;
};

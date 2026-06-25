import { supabase } from '../lib/supabase';
import { fetchUserProfile } from '../db/profiles';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getSession = async (): Promise<Session | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
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
  await supabase.auth.signOut();
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

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  return fetchUserProfile(userId);
};

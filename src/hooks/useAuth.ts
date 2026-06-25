import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';
import * as authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, retries = 3): Promise<void> => {
    try {
      const data = await authService.getUserProfile(userId);

      if (!data) {
        // Handle race condition where profile trigger runs slightly after session return
        if (retries > 0) {
          await new Promise((res) => setTimeout(res, 400));
          return fetchProfile(userId, retries - 1);
        }
        throw new Error('Profile not found.');
      }
      setProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      const rawUser = await authService.getCurrentUser();
      if (rawUser && rawUser.id === userId) {
        setProfile({
          id: rawUser.id,
          display_name:
            rawUser.user_metadata.full_name ||
            rawUser.user_metadata.name ||
            'New User',
          avatar_url: rawUser.user_metadata.avatar_url || null,
          email: rawUser.email || '',
          created_at: rawUser.created_at,
        });
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    authService.getSession().then((session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const subscription = authService.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          setLoading(true);
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return { user, profile, loading, signOut };
};

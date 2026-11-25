import type { UserProfile } from '@/api/types';
import { supabase } from '@/lib/supabase';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data;
};

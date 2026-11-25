import { createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/api/types';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  profileError: Error | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

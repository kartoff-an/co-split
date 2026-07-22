import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

vi.mock('../../db/profiles', () => ({
  fetchUserProfile: vi.fn(),
}));

import { getCurrentUser, signOut, getUserProfile } from '../authService';
import { supabase } from '../../lib/supabase';
import { fetchUserProfile } from '../../db/profiles';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return user object when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
      expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
    });

    it('should return null when unauthenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should call supabase auth.signOut', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      await signOut();
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserProfile', () => {
    it('should delegate to fetchUserProfile', async () => {
      const mockProfile = {
        id: 'user-123',
        display_name: 'Test User',
        email: 'test@example.com',
        avatar_url: null,
        created_at: '2026-01-01',
      };
      vi.mocked(fetchUserProfile).mockResolvedValue(mockProfile);

      const profile = await getUserProfile('user-123');
      expect(profile).toEqual(mockProfile);
      expect(fetchUserProfile).toHaveBeenCalledWith('user-123');
    });
  });
});

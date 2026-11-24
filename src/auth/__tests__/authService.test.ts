import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
  signInWithOAuth: vi.fn(),
  apiGet: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: mocks.getUser,
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signOut: mocks.signOut,
      signInWithOAuth: mocks.signInWithOAuth,
    },
  },
}));

vi.mock('@/api/client', () => ({
  api: {
    get: mocks.apiGet,
  },
}));

import {
  getCurrentUser,
  getSession,
  getUserProfile,
  onAuthStateChange,
  signInWithGoogle,
  signOut,
} from '@/auth/authService';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('returns authenticated Supabase user', async () => {
      const user = { id: 'user-1' } as User;

      mocks.getUser.mockResolvedValue({
        data: { user },
        error: null,
      });

      await expect(getCurrentUser()).resolves.toBe(user);
    });

    it('propagates Supabase authentication errors', async () => {
      const error = new Error('Invalid JWT');

      mocks.getUser.mockResolvedValue({
        data: { user: null },
        error,
      });

      await expect(getCurrentUser()).rejects.toBe(error);
    });
  });

  describe('getSession', () => {
    it('restores persisted session', async () => {
      const session = {
        access_token: 'access-token',
        user: { id: 'user-1' },
      } as Session;

      mocks.getSession.mockResolvedValue({
        data: { session },
        error: null,
      });

      await expect(getSession()).resolves.toBe(session);
    });

    it('returns null when no session exists', async () => {
      mocks.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await expect(getSession()).resolves.toBeNull();
    });

    it('propagates session restoration errors', async () => {
      const error = new Error('Session storage unavailable');

      mocks.getSession.mockResolvedValue({
        data: { session: null },
        error,
      });

      await expect(getSession()).rejects.toBe(error);
    });
  });

  describe('onAuthStateChange', () => {
    it('returns subscription cleanup handle and forwards auth events', () => {
      const unsubscribe = vi.fn();
      const callback = vi.fn();

      mocks.onAuthStateChange.mockImplementation(() => ({
        data: {
          subscription: { unsubscribe },
        },
      }));

      const subscription = onAuthStateChange(callback);

      const session = { user: { id: 'user-1' } } as Session;
      const registeredCallback = mocks.onAuthStateChange.mock.calls[0][0];

      registeredCallback('SIGNED_IN' as AuthChangeEvent, session);

      expect(callback).toHaveBeenCalledWith('SIGNED_IN', session);

      subscription.unsubscribe();

      expect(unsubscribe).toHaveBeenCalledOnce();
    });
  });

  describe('signInWithGoogle', () => {
    it('preserves Google OAuth provider and callback URL', async () => {
      mocks.signInWithOAuth.mockResolvedValue({ error: null });

      await signInWithGoogle();

      expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    });

    it('propagates OAuth errors', async () => {
      const error = new Error('OAuth provider unavailable');

      mocks.signInWithOAuth.mockResolvedValue({ error });

      await expect(signInWithGoogle()).rejects.toBe(error);
    });
  });

  describe('signOut', () => {
    it('signs out through Supabase', async () => {
      mocks.signOut.mockResolvedValue({ error: null });

      await signOut();

      expect(mocks.signOut).toHaveBeenCalledOnce();
    });

    it('propagates sign-out errors', async () => {
      const error = new Error('Sign-out failed');

      mocks.signOut.mockResolvedValue({ error });

      await expect(signOut()).rejects.toBe(error);
    });
  });

  describe('getUserProfile', () => {
    it('retrieves profile from FastAPI without accepting a client-supplied user ID', async () => {
      const profile = {
        id: 'user-1',
        display_name: 'Test User',
        avatar_url: null,
        email: 'test@example.com',
        created_at: '2026-01-01T00:00:00Z',
      };

      mocks.apiGet.mockResolvedValue({ data: profile });

      await expect(getUserProfile()).resolves.toEqual(profile);

      expect(mocks.apiGet).toHaveBeenCalledWith('/users/me');
      expect(mocks.apiGet).toHaveBeenCalledOnce();
    });

    it('propagates API errors instead of falling back to Supabase metadata', async () => {
      const error = new Error('Profile not found');

      mocks.apiGet.mockRejectedValue(error);

      await expect(getUserProfile()).rejects.toBe(error);
    });
  });
});

import { supabase } from '@/lib/supabase';

const testUsers = {
  luca: 'luca@cosplit.test',
  tony: 'tony@cosplit.test',
  sophia: 'sophia@cosplit.test',
  max: 'max@cosplit.test',
} as const;

type TestUser = keyof typeof testUsers;

declare global {
  interface Window {
    cosplitLoginAs: (
      user: TestUser,
      password: string
    ) => Promise<void>;
  }
}

if (import.meta.env.DEV) {
  window.cosplitLoginAs = async (user, password) => {
    const email = testUsers[user];

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    console.log('Authenticated:', data.user.email);

    // Navigate to the dashboard after login.
    window.location.href = '/dashboard';
  };
}
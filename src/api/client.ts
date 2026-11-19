import { supabase } from '@/lib/supabase';
import axios from 'axios';
import { normalizeApiError } from './errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Attach latest Supabase access token to every request.
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  if (session?.access_token) {
    config.headers.set('Authorization', `Bearer ${session.access_token}`);
  } else {
    config.headers.set('Authorization', null);
  }

  return config;
});

// Normalize all HTTP and network errors.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    return Promise.reject(normalizeApiError(error));
  }
);

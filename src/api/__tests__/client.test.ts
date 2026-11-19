
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase';
import { api } from '@/api/client';
import { ApiError } from '../errors';

const getSession = vi.mocked(supabase.auth.getSession);

function createAdapter() {
  let capturedConfig: InternalAxiosRequestConfig | undefined;

  const adapter: AxiosAdapter = async (config) => {
    capturedConfig = config;

    return {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config,
    };
  };

  return {
    adapter,
    getConfig: () => capturedConfig,
  };
}

describe('API client authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches latest Supabase access token to request', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'current-access-token',
        },
      },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    const request = createAdapter();

    await api.get('/test', {
      adapter: request.adapter,
    });

    expect(
      request.getConfig()?.headers.get('Authorization'),
    ).toBe('Bearer current-access-token');
  });

  it('does not send stale authorization header when session is missing', async () => {
    getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    const request = createAdapter();

    await api.get('/test', {
      adapter: request.adapter,
      headers: {
        Authorization: 'Bearer stale-token',
      },
    });

    expect(
      request.getConfig()?.headers.toJSON(),
    ).not.toHaveProperty('Authorization');
  });

  it('does not send authorization header when session has no access token', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: '',
        },
      },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    const request = createAdapter();

    await api.get('/test', {
      adapter: request.adapter,
    });

    expect(
      request.getConfig()?.headers.toJSON(),
    ).not.toHaveProperty('Authorization');
  });

  it('rejects request when Supabase session lookup fails', async () => {
    getSession.mockResolvedValue({
      data: { session: null },
      error: new Error('Session lookup failed'),
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    const request = createAdapter();

    await expect(
      api.get('/test', { adapter: request.adapter }),
    ).rejects.toThrow('Session lookup failed');

    expect(request.getConfig()).toBeUndefined();
  });

  it('normalizes backend HTTP errors through response interceptor', async () => {
  getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

  const adapter: AxiosAdapter = async (config) => {
    throw new AxiosError(
      'Request failed',
      AxiosError.ERR_BAD_REQUEST,
      config,
      undefined,
      {
        data: {
          success: false,
          message: 'Workspace not found',
          error: {
            code: 'WORKSPACE_NOT_FOUND',
            details: null,
          },
        },
        status: 404,
        statusText: 'Not Found',
        headers: new AxiosHeaders(),
        config,
      },
    );
  };

  await expect(
    api.get('/test', { adapter }),
  ).rejects.toMatchObject({
    name: 'ApiError',
    message: 'Workspace not found',
    status: 404,
    code: 'WORKSPACE_NOT_FOUND',
  });

  await expect(
    api.get('/test', { adapter }),
  ).rejects.toBeInstanceOf(ApiError);
});
});

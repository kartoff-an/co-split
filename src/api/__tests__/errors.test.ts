import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { normalizeApiError } from '@/api/errors';

function createAxiosError(data?: unknown, status?: number): AxiosError {
  const config = {
    headers: new AxiosHeaders(),
  } as InternalAxiosRequestConfig;

  if (status === undefined) {
    return new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);
  }

  const response: AxiosResponse = {
    data,
    status,
    statusText: 'Error',
    headers: new AxiosHeaders(),
    config,
  };

  return new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, undefined, response);
}

describe('normalizeApiError', () => {
  it('preserves backend envelope error metadata', () => {
    const error = createAxiosError(
      {
        success: false,
        message: 'Workspace access denied',
        error: {
          code: 'WORKSPACE_FORBIDDEN',
          details: { workspace_id: 'workspace-123' },
        },
      },
      403
    );

    const normalized = normalizeApiError(error);

    expect(normalized.message).toBe('Workspace access denied');
    expect(normalized.status).toBe(403);
    expect(normalized.code).toBe('WORKSPACE_FORBIDDEN');
    expect(normalized.details).toEqual({
      workspace_id: 'workspace-123',
    });
    expect(normalized.isNetworkError).toBe(false);
  });

  it('supports FastAPI string detail responses', () => {
    const error = createAxiosError({ detail: 'Not authenticated' }, 401);

    const normalized = normalizeApiError(error);

    expect(normalized.message).toBe('Not authenticated');
    expect(normalized.status).toBe(401);
    expect(normalized.details).toBe('Not authenticated');
  });

  it('preserves structured FastAPI detail responses', () => {
    const detail = [
      {
        loc: ['body', 'name'],
        msg: 'Field required',
        type: 'missing',
      },
    ];

    const error = createAxiosError({ detail }, 422);
    const normalized = normalizeApiError(error);

    expect(normalized.status).toBe(422);
    expect(normalized.details).toEqual(detail);
    expect(normalized.message).toBe('The request could not be completed.');
  });

  it('identifies network errors without HTTP responses', () => {
    const error = createAxiosError();

    const normalized = normalizeApiError(error);

    expect(normalized.message).toBe('Unable to connect to the server.');
    expect(normalized.status).toBeUndefined();
    expect(normalized.isNetworkError).toBe(true);
  });

  it('handles non-Axios errors without losing their message', () => {
    const normalized = normalizeApiError(new Error('Unexpected application error'));

    expect(normalized.message).toBe('Unexpected application error');
    expect(normalized.status).toBeUndefined();
    expect(normalized.isNetworkError).toBe(false);
  });

  it('handles unknown thrown values', () => {
    const normalized = normalizeApiError('unexpected');

    expect(normalized.message).toBe('An unexpected error occurred.');
  });
});

import type { components } from '@/api/generated/schema';

export type ApiError = components['schemas']['ApiError'];

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiError | null;
}

/**
 * Error response shape accepted by the Axios error normalizer.
 *
 * `detail` supports FastAPI's default HTTP error format.
 * `error` supports Co-Split's standardized error envelope.
 */
export interface ApiErrorBody {
  success?: boolean;
  message?: string;
  detail?: unknown;
  error?: ApiError | null;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

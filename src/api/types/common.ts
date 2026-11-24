import type { components } from '@/api/generated/schema';

export type ApiError = components['schemas']['ApiError'];

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiError | null;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}
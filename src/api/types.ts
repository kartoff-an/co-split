export interface ApiErrorPayload {
    code: string;
    details?: unknown;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    error: ApiErrorPayload | null;
}

export interface ApiErrorBody {
    success?: boolean;
    message?: string;
    detail?: unknown;
    error?: {
        code?: string;
        details?: unknown;
    } | null;
}
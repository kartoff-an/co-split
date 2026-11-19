import axios from 'axios';
import type { ApiErrorBody } from './types';

export class ApiError extends Error {
    readonly status: number | undefined;
    readonly code: string | undefined;
    readonly details: unknown;
    readonly isNetworkError: boolean;

    constructor({
        message,
        status,
        code,
        details,
        isNetworkError = false
    }: {
        message: string;
        status?: number;
        code?: string;
        details?: unknown;
        isNetworkError?: boolean;
    }) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
        this.isNetworkError = isNetworkError;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export function normalizeApiError(error: unknown): ApiError {
    if (!axios.isAxiosError<ApiErrorBody>(error)) {
        return new ApiError({
            message: error instanceof Error ? error.message : "An unexpected error occurred."
        });
    }

    const response = error.response;
    const body = response?.data;
    const detail = typeof body?.detail === 'string' ? body.detail : undefined;
    const message = body?.message ?? detail ?? (
        response ? "The request could not be completed." : "Unable to connect to the server."
    );

    return new ApiError({
        message,
        status: response?.status,
        code: body?.error?.code,
        details: body?.error?.details ?? body?.detail,
        isNetworkError: !response
    });
}
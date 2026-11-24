import type { AxiosResponse } from "axios";
import type { ApiResponse } from "./types";
import { ApiError } from "./errors";

export function requireApiData<T>(
    response: AxiosResponse<ApiResponse<T>>
): T {
    const payload = response.data;

    if (!payload.success || payload.data === null) {
        throw new ApiError({
            message: payload.message || 'The request could not be completed.',
            code: payload.error?.code,
            details: payload.error?.details,
        });
    }

    return payload.data;
}


export function requireApiSuccess(
    response: AxiosResponse<ApiResponse<unknown>>
): void {
    const payload = response.data;

    if (!payload.success) {
        throw new ApiError({
            message: payload.message || 'The request could not be completed.',
            code: payload.error?.code,
            details: payload.error?.details,
        });
    }
}

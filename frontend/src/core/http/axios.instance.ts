import axios from 'axios';
import type { ApiError } from '../types/api-response.type';

const envBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const apiBaseUrl = envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : 'http://localhost:3000/api';

const http = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data as Partial<ApiError> | undefined;
      const normalized: ApiError = {
        success: false,
        error: {
          code: data?.error?.code ?? 'INTERNAL_ERROR',
          message: data?.error?.message ?? error.message,
          details: Array.isArray(data?.error?.details) ? data.error.details : [],
        },
        path: data?.path ?? '',
        timestamp: data?.timestamp ?? new Date().toISOString(),
      };
      return Promise.reject(normalized);
    }
    return Promise.reject(error);
  },
);

export default http;

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
  path?: string;
  timestamp?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

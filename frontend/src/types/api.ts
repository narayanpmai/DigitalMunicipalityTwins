export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Matches buildPaginatedResult() in thai-rap-api/src/shared/pagination.util.ts
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Raw server error response shape — use ApiError class from services/api-error.ts in app code */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

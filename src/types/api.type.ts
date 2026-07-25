export interface ApiResponse<TData = unknown> {
  success: true;
  message?: string;
  data: TData | null;
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  message?: string;
}
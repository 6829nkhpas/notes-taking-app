export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const createApiError = (message: string, status: number = 500, code?: string, details?: any) => {
  return new ApiError(message, status, code, details);
};

import axios from "axios";

type ErrorResponse = {
  error?: unknown;
};

export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string | null;
  readonly originalError?: unknown;

  constructor(
    message: string,
    status: number | null = null,
    code: string | null = null,
    originalError?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.originalError = originalError;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (!axios.isAxiosError<ErrorResponse>(error)) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
    return new ApiError(message, null, null, error);
  }

  const status = error.response?.status ?? null;
  const responseMessage = error.response?.data?.error;
  const message =
    typeof responseMessage === "string"
      ? responseMessage
      : error.response
        ? error.message
        : "Không thể kết nối đến máy chủ FlexFit.";
  const code = error.code ?? (status === null ? null : `HTTP_${status}`);

  return new ApiError(message, status, code, error);
}

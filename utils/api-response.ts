import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta: Record<string, unknown>;
  error?: string;
}

/**
 * Standard API response helper
 */
export function apiResponse<T>(
  data: T,
  {
    status = 200,
    meta = {},
    success = true,
    error,
  }: {
    status?: number;
    meta?: Record<string, unknown>;
    success?: boolean;
    error?: string;
  } = {}
) {
  return NextResponse.json(
    {
      success,
      data,
      meta,
      ...(error && { error }),
    },
    { status }
  );
}

/**
 * Standard API error helper
 */
export function apiError(
  message: string,
  status: number = 400,
  data: unknown = null
) {
  return apiResponse(data, {
    success: false,
    error: message,
    status,
  });
}

/**
 * Standardized error handling utilities for API routes.
 * Provides consistent error responses and error classification.
 */
import { NextResponse } from "next/server";

export type ErrorCategory = "validation" | "authentication" | "authorization" | "not_found" | "rate_limit" | "internal";

export interface AppError {
  message: string;
  category: ErrorCategory;
  status: number;
  details?: unknown;
}

/**
 * Create a standardized application error.
 */
export function createError(
  message: string,
  category: ErrorCategory,
  details?: unknown,
): AppError {
  const statusMap: Record<ErrorCategory, number> = {
    validation: 400,
    authentication: 401,
    authorization: 403,
    not_found: 404,
    rate_limit: 429,
    internal: 500,
  };

  return {
    message,
    category,
    status: statusMap[category],
    details,
  };
}

/**
 * Convert an unknown error to a standardized AppError.
 */
export function toAppError(err: unknown): AppError {
  if (err && typeof err === "object" && "category" in err && "status" in err) {
    return err as AppError;
  }

  if (err instanceof Error) {
    if (err.message.includes("not found") || err.message.includes("404")) {
      return createError(err.message, "not_found");
    }
    if (err.message.includes("unauthorized") || err.message.includes("401")) {
      return createError(err.message, "authentication");
    }
    if (err.message.includes("forbidden") || err.message.includes("403")) {
      return createError(err.message, "authorization");
    }
    if (err.message.includes("rate limit") || err.message.includes("429")) {
      return createError(err.message, "rate_limit");
    }
    return createError(err.message, "internal");
  }

  return createError("An unexpected error occurred", "internal");
}

/**
 * Create a standardized error response for API routes.
 */
export function errorResponse(err: unknown): NextResponse {
  const appError = toAppError(err);

  if (process.env.NODE_ENV === "development") {
    console.error(`[${appError.category}] ${appError.message}`, appError.details);
  }

  return NextResponse.json(
    {
      error: appError.message,
      category: appError.category,
      ...(process.env.NODE_ENV === "development" && appError.details
        ? { details: appError.details }
        : {}),
    },
    { status: appError.status },
  );
}

/**
 * Success response wrapper for consistency.
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

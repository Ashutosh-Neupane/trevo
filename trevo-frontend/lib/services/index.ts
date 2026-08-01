/**
 * Services barrel export
 *
 * Centralized exports for all service modules.
 * Reference: implementation1/17-service-layer.md
 */

export { checkRateLimit } from "./rateLimiter";
export type { RateLimitOptions } from "./rateLimiter";

export {
  generateCsrfToken,
  validateCsrfToken,
  getCsrfHeaderName,
  getCsrfCookieName,
  requiresCsrfProtection,
} from "./csrf";

export {
  createError,
  toAppError,
  errorResponse,
  successResponse,
} from "./errorHandler";

export type { AppError, ErrorCategory } from "./errorHandler";
